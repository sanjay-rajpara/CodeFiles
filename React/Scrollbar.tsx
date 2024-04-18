
import React, { useState, useEffect, useRef, useCallback } from 'react';

const Scrollbar = ({
    children,
    className,
    ...props
}: React.ComponentPropsWithoutRef<'div'>) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const scrollTrackRef = useRef<HTMLDivElement>(null);
    const scrollThumbRef = useRef<HTMLDivElement>(null);
    const observer = useRef<ResizeObserver | null>(null);
    const [thumbHeight, setThumbHeight] = useState(0);
    const [scrollStartPosition, setScrollStartPosition] = useState<any>(null);
    const [initialScrollTop, setInitialScrollTop] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const scrollbarRef = useRef(null)

    function handleResize(ref: HTMLDivElement, trackSize: number) {
        const { clientHeight, scrollHeight } = ref;
        setThumbHeight(Math.max((clientHeight / scrollHeight) * trackSize, 20));
    }

    const handleTrackClick = useCallback(
        (e: any) => {
            e.preventDefault();
            e.stopPropagation();
            const { current: trackCurrent } = scrollTrackRef;
            const { current: contentCurrent } = contentRef;
            if (trackCurrent && contentCurrent) {
                const { clientY } = e;
                const target = e.target as HTMLDivElement;
                const rect = target.getBoundingClientRect();
                const trackTop = rect.top;
                const thumbOffset = -(thumbHeight / 2);
                const clickRatio =
                    (clientY - trackTop + thumbOffset) / trackCurrent.clientHeight;
                const scrollAmount = Math.floor(
                    clickRatio * contentCurrent.scrollHeight
                );
                contentCurrent.scrollTo({
                    top: scrollAmount,
                    behavior: 'smooth',
                });
            }
        },
        [thumbHeight]
    );

    const handleThumbPosition = useCallback(() => {
        if (
            !contentRef.current ||
            !scrollTrackRef.current ||
            !scrollThumbRef.current
        ) {
            return;
        }

        const { scrollTop: contentTop, scrollHeight: contentHeight } =
            contentRef.current;
        const { clientHeight: trackHeight } = scrollTrackRef.current;
        let newTop = (+contentTop / +contentHeight) * trackHeight;
        newTop = Math.min(newTop, trackHeight - thumbHeight);
        const thumb = scrollThumbRef.current;
        thumb.style.top = `${newTop}px`;
    }, []);

    const handleThumbMousedown = useCallback((e: any) => {
        if (e.target?.classList?.contains('stop-scroll')) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        setScrollStartPosition(e.clientY);
        if (contentRef.current) setInitialScrollTop(contentRef.current.scrollTop);
        setIsDragging(true);
    }, []);

    const handleThumbMouseup = useCallback(
        (e: any) => {
            if (e.target?.classList?.contains('stop-scroll')) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            if (isDragging) {
                setIsDragging(false);
            }
        },
        [isDragging]
    );

    const handleThumbMousemove = useCallback(
        (e: any) => {
            if (e.target?.classList?.contains('stop-scroll')) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            if (isDragging) {
                const {
                    scrollHeight: contentScrollHeight,
                    offsetHeight: contentOffsetHeight,
                } = contentRef.current as any;

                const deltaY =
                    (e.clientY - scrollStartPosition) *
                    (contentOffsetHeight / thumbHeight);
                const newScrollTop = Math.min(
                    initialScrollTop + deltaY,
                    contentScrollHeight - contentOffsetHeight
                );

                (contentRef.current as any).scrollTop = newScrollTop;
            }
        },
        [isDragging, scrollStartPosition, thumbHeight]
    );

    // If the content and the scrollbar track exist, use a ResizeObserver to adjust height of thumb and listen for scroll event to move the thumb
    useEffect(() => {
        if (contentRef.current && scrollTrackRef.current) {
            const ref = contentRef.current;
            const { clientHeight: trackSize } = scrollTrackRef.current;

            observer.current = new ResizeObserver(() => {
                handleResize(ref, trackSize);
            });

            observer.current.observe(ref);
            ref.addEventListener('scroll', handleThumbPosition);

            // Clean up the observer and event listener when the component unmounts
            return () => {
                observer.current?.unobserve(ref);
                ref.removeEventListener('scroll', handleThumbPosition);
            };
        }
    }, []);

    const handleContentChange = useCallback(() => {
        handleResize(contentRef.current as HTMLDivElement, (scrollTrackRef.current as any)?.clientHeight);
        handleThumbPosition();
    }, [handleThumbPosition]);
    useEffect(() => {
        const contentElement = contentRef.current;
        if (contentElement) {
            const observer = new MutationObserver(handleContentChange);
            observer.observe(contentElement, { subtree: true, childList: true });

            // Cleanup the observer when the component unmounts
            return () => {
                observer.disconnect();
            };
        }
    }, [handleContentChange]);

    useEffect(() => {
        const contentElement = contentRef.current;
        const scrollbarElement: any = scrollbarRef.current;

        if (contentElement && scrollbarElement) {
            const handleResize = () => {
                const doesOverflow = contentElement.scrollHeight > contentElement.clientHeight;
                scrollbarElement.style.display = doesOverflow ? 'block' : 'none';
            };

            observer.current = new ResizeObserver(handleResize);
            observer.current.observe(contentElement);

            return () => {
                observer.current?.disconnect();
            };
        }
    }, [children]);

    // Listen for mouse events to handle scrolling by dragging the thumb
    useEffect(() => {
        document.addEventListener('mousemove', handleThumbMousemove);
        document.addEventListener('mouseup', handleThumbMouseup);
        document.addEventListener('mouseleave', handleThumbMouseup);
        return () => {
            document.removeEventListener('mousemove', handleThumbMousemove);
            document.removeEventListener('mouseup', handleThumbMouseup);
            document.removeEventListener('mouseleave', handleThumbMouseup);
        };
    }, [handleThumbMousemove, handleThumbMouseup]);

    //touch events
    const handleThumbTouchStart = useCallback((e: any) => {
        if (e.cancelable) {
            e.preventDefault();
        }
        e.stopPropagation();
        setScrollStartPosition(e.touches[0].clientY);
        if (contentRef.current) setInitialScrollTop(contentRef.current.scrollTop);
        setIsDragging(true);
    }, []);

    const handleThumbTouchMove = useCallback(
        (e: any) => {
            e.stopPropagation();
            if (isDragging) {
                const {
                    scrollHeight: contentScrollHeight,
                    offsetHeight: contentOffsetHeight,
                } = contentRef.current as any;

                const deltaY =
                    (e.touches[0].clientY - scrollStartPosition) *
                    (contentOffsetHeight / thumbHeight);
                const newScrollTop = Math.min(
                    initialScrollTop + deltaY,
                    contentScrollHeight - contentOffsetHeight
                );

                (contentRef.current as any).scrollTop = newScrollTop;
                handleThumbPosition(); // Update thumb position during touch move
            }
        },
        [isDragging, scrollStartPosition, thumbHeight, handleThumbPosition]
    );

    const handleThumbTouchEnd = useCallback(
        (e: any) => {
            e.preventDefault();
            e.stopPropagation();
            if (isDragging) {
                setIsDragging(false);
            }
        },
        [isDragging]
    );

    useEffect(() => {
        // Listen for touch events in addition to mouse events
        const thumbElement = scrollThumbRef.current;

        if (thumbElement) {
            thumbElement.addEventListener("touchstart", handleThumbTouchStart);
            thumbElement.addEventListener("touchmove", handleThumbTouchMove);
            thumbElement.addEventListener("touchend", handleThumbTouchEnd);

            return () => {
                // Remove touch event listeners when the component unmounts
                thumbElement.removeEventListener("touchstart", handleThumbTouchStart);
                thumbElement.removeEventListener("touchmove", handleThumbTouchMove);
                thumbElement.removeEventListener("touchend", handleThumbTouchEnd);
            };
        }
    }, [handleThumbTouchStart, handleThumbTouchMove, handleThumbTouchEnd]);

    return (
        <div className="custom-scrollbars__container">
            <div className={`custom-scrollbars__content ${className}`} ref={contentRef} {...props}>
                {children}
            </div>
            <div className="custom-scrollbars__scrollbar" ref={scrollbarRef}>
                <div className="custom-scrollbars__track-and-thumb">
                    <div
                        className="custom-scrollbars__track"
                        ref={scrollTrackRef}
                        onClick={handleTrackClick}
                        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                    ></div>
                    <div
                        className="custom-scrollbars__thumb"
                        ref={scrollThumbRef}
                        onMouseDown={handleThumbMousedown}
                        style={{
                            height: `${thumbHeight}px`,
                            cursor: isDragging ? 'grabbing' : 'grab',
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default Scrollbar;
