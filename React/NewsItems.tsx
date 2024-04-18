import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SvgHelper } from '../../components/core/SvgHelper';
import Select from 'react-select';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Modal from 'react-bootstrap/Modal';
import defaultnewsImage from '/src/assets/images/defaultnews-Image.png'
import iconDownload from '/src/assets/images/icon-download.svg';
import iconSearch from '/src/assets/images/icon-search.svg';
import iconList from '/src/assets/images/icon-list.svg';
import iconGrid from '/src/assets/images/icon-grid.svg';
import iconPlus from '/src/assets/images/icon-plus.svg';
import iconSelect from '/src/assets/images/icon-select.svg';
import { IArticleModel } from '../../interfaces/article.interface';
import NewsitemsListView from './NewsitemsListView';
import NewsItemSummary from './NewsItemSummary';
import NewsItemsReviewVideo from './NewsItemsReviewVideo';
import iconClose from '/src/assets/images/icon-close.svg';
import { downloadZip, getArticles } from '../../services/article.service';
import Scrollbar from '../../components/core/Scrollbar';
import HorizontalScrollbar from '../../components/core/HorizontalScrollbar';
import toast from 'react-hot-toast';
import Loader from '../../components/core/Loader';

const options = [
	{ value: 'asc', label: 'Oldest' },
	{ value: 'dsc', label: 'Newest' },
];
export const NewsItems = () => {
	const navigate = useNavigate();
	function toggleBodyClass(className: string): void {
		let body = document.querySelector('body');
		if (body?.classList.contains(className)) {
			body?.classList.remove(className);
		} else {
			body?.classList.add(className);
		}
	}

	function toggleCategoryClass(className: string): void {
		let itemCategory = document.querySelector('.item-category');
		if (itemCategory?.classList.contains(className)) {
			itemCategory?.classList.remove(className);
		} else {
			itemCategory?.classList.add(className);
		}
	}
	function toggleClass(className: string): void {
		let itemCategory = document.querySelector('.item-category');
		if (itemCategory?.classList.contains(className)) {
			itemCategory?.classList.remove(className);
		}
	}
	const [searchTerm, setSearchTerm] = useState('');
	const [showLoader, setShowLoader] = useState(true);
	const [show, setShow] = useState(false);
	const [isGridView, setIsGridView] = useState(true);
	const [isInWorkItem, setIsInWorkItem] = useState(true);
	const [isPublished, setIsPublished] = useState(true);
	const [isWaitingForReview, setIsWaitingForReview] = useState(true);
	const [isWaiting, setIsWaiting] = useState(false);
	const [isInWork, setIsInWork] = useState(false);
	const [isPublish, setIsPublish] = useState(false);
	const [articleId, setArticleId] = useState("")

	const handleClose = () => setShow(false);
	const handleShow = (e: any, data: IArticleModel) => {
		if (e.target.classList.contains('download-button') || e.target.closest('.download-button')) {
			return
		}
		setShow(true);
		setCardData(data)
		setArticleId(data.id)
	}

	const [show1, setShow1] = useState(false);

	const handleClose1 = () => setShow1(false);
	const [articles, setArticles] = useState<IArticleModel[]>([]);
	const [publishedArticle, setPublishedArticle] = useState<IArticleModel[]>([]);
	const [inWorkArticle, setInworkArticle] = useState<IArticleModel[]>([]);
	const [waitingForReview, setWaitingForReview] = useState<IArticleModel[]>([]);
	const [cardData, setCardData] = useState<IArticleModel | null>(null);
	const [isSearch, setIsSearch] = useState(false);
	const [sortDirection, setSortDirection] = useState('dsc')
	const toggleViews = (data: string) => {
		if (data === "all") {
			toggleCategoryClass('item-category-open');
			setIsInWorkItem(true);
			setIsPublished(true);
			setIsWaitingForReview(true);
			setIsPublish(false);
			setIsWaiting(false);
			setIsInWork(false);
			return;
		}
		if (data === "inwork") {
			toggleCategoryClass('item-category-open');
			showCards("inwork");
			setIsInWork(true);
			setIsPublish(false);
			setIsWaiting(false);

			return;
		}
		if (data === "isWaiting") {
			toggleCategoryClass('item-category-open');
			showCards("waitforReview");
			setIsWaiting(true);
			setIsPublish(false);
			setIsInWork(false);
			return;
		}
		if (data === 'isPublished') {
			toggleCategoryClass('item-category-open');
			showCards("published");
			setIsPublish(true);
			setIsWaiting(false);
			setIsInWork(false);
			return;
		}

	}
	const closeSearch = () => {
		handleClose1();
		setSearchTerm("");
		setIsSearch(false);
	}

	const sortData = (option: any) => {
		if (option === "asc") {
			const ascendingData = [...articles].sort((a: IArticleModel, b: IArticleModel) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
			setArticles(ascendingData);
		}
		if (option === "dsc") {
			const descendingData = [...articles].sort((a: IArticleModel, b: IArticleModel) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
			setArticles(descendingData);
		}
	};

	const handleSortChange = (selectedOption: any) => {
		setSortDirection(selectedOption);
		sortData(selectedOption.value)
	};
	const handleFocus = (e: any) => {
		toggleClass('item-category-open');
	};

	const getSearchTerm = (e: any) => {
		setSearchTerm(e.target.value)
	}

	useEffect(() => {
		getAllArticles();
	}, [])
	const searchedArticles = useMemo(() => {
		if (sortDirection === "asc") {
			return articles.filter((article: IArticleModel) => (article.name.toLowerCase().includes(searchTerm.toLowerCase()) || article.reporter.name.toLowerCase().includes(searchTerm.toLowerCase()))).sort((a: IArticleModel, b: IArticleModel) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
		}
		if (sortDirection === "dsc") {
			return articles.filter((article: IArticleModel) => (article.name.toLowerCase().includes(searchTerm.toLowerCase()) || article.reporter.name.toLowerCase().includes(searchTerm.toLowerCase()))).sort((a: IArticleModel, b: IArticleModel) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		}
		return articles.filter((article: IArticleModel) => (article.name.toLowerCase().includes(searchTerm.toLowerCase()) || article.reporter.name.toLowerCase().includes(searchTerm.toLowerCase())))
	}, [searchTerm, sortDirection])
	const showCards = (status: string) => {
		setIsPublished(true);
		setIsWaitingForReview(true);
		setIsInWorkItem(true);
		if (status === "inwork") {
			setIsPublished(false);
			setIsWaitingForReview(false);
			return;
		}
		if (status === "waitforReview") {
			setIsPublished(false);
			setIsInWorkItem(false);
			return;
		}
		setIsInWorkItem(false);
		setIsWaitingForReview(false);
	};
	const getAllArticles = async () => {
		//this code will work with api
		try {
			const response = await getArticles();
			const descendingData = [...response.data.data.articles].sort((a: IArticleModel, b: IArticleModel) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
			setArticles(descendingData);
			setShowLoader(false);
		} catch (error) {
			setShowLoader(false);
			console.log(error);
		}
	}
	const filterData = () => {
		const copiedArticles = !searchTerm ? articles : searchedArticles
		const inWork = copiedArticles.filter((article) => !article.outputZip && !article.approved);
		setInworkArticle(inWork)

		//to filter WaitingForReview
		const data = copiedArticles.filter(
			(article) => article.outputZip && !article.approved
		);
		setWaitingForReview(data)
		//to filter published article
		const published = copiedArticles.filter((article) => article.outputZip && article.approved);
		setPublishedArticle(published)
	}
	const downloadArticleZip = async (articleId: string) => {
		try {
			const res = await downloadZip(articleId);
			if (res.data.data) {
				toast.success("Download started")
				window.open(res.data.data, "_blank")
			} else {
				toast.error('Something went wrong, Please try again.');
			}
		} catch (e: any) {
			toast.error("Download failed")
			console.log(e.response.data.message);
		}
	}
	useEffect(() => {
		filterData();
		if (searchTerm === "") {
			setIsSearch(false)
		} else {
			setIsSearch(true)
		}
	}, [searchTerm, articles])

	return (
		<>
			<section className="section-news bg-white flex-grow-1 overflow-hidden p-4 p-xl-6 p-3xl-8 pt-4xl-9 pe-4xl-12 ps-4xl-16 pb-0 pb-xl-0 pb-xxl-0 pb-3xl-0 pb-4xl-0 rounded-xl h-100 d-flex flex-column">
				<div className="section-head mb-2 mb-sm-4 mb-xl-6 mb-3xl-8 mb-4xl-13 d-flex flex-column flex-md-row align-items-md-center">
					<div className="d-flex align-items-center mb-2 mb-md-0">
						<span className="d-xl-none nav-toggle cursor-pointer me-2" onClick={() => { toggleBodyClass('aside-open') }}>
							<span className="d-none">Menu</span>
							<span className="bar"></span>
							<span className="bar"></span>
							<span className="bar"></span>
						</span>
						<h1 className="w-auto">News Articles</h1>
					</div>
					<div className="ms-md-auto flex-fill d-flex justify-content-between flex-md-row-reverse gap-1 gap-md-2">
						<Form className="form-search form-search-close position-relative" onSubmit={(e) => { e.preventDefault(); }}>
							<Form.Group controlId="exampleForm.ControlInput1">
								<Form.Label className="d-none">Email address</Form.Label>
								<Form.Control className="rounded-pill" type="text" placeholder="Search for items" value={searchTerm} onChange={(e) => { getSearchTerm(e) }} />
							</Form.Group>
							{
								isSearch ?
									<span className="icon-close cursor-pointer position-absolute text-black opacity-25" onClick={() => { closeSearch(); }}><SvgHelper src={iconClose} width='15.121' height="15.121" title="Close" /></span>
									: ""
							}
							<Button className="position-absolute top-0 end-0 p-2 p-md-0 icon-search text-center text-black" variant="link" type='submit' ><SvgHelper src={iconSearch} width='27' height="27" title="Search" /></Button>
						</Form>
						<Button variant="primary ms-md-2 ms-xxl-7 text-nowrap d-flex align-items-center px-3 px-md-5" onClick={() => navigate('/create-article')}><i className="icon d-sm-none"><SvgHelper src={iconPlus} width='20' height="20" title="Plus" /></i><span className="d-none d-sm-inline-block">Create New</span></Button>
					</div>
				</div>
				<div className="item-filter d-flex justify-content-between mb-sm-4 mb-xl-6 mb-3xl-8 border-bottom border-light gap-4 gap-xl-8 gap-3xl-8 position-relative pb-2 pb-md-0 z-1">
					<div className="item-category overflow-auto">
						<HorizontalScrollbar>
							<ul className="transition d-flex flex-column flex-md-row align-items-md-center gap-2 gap-md-4 gap-3xl-6 gap-4xl-8 text-nowrap">
								<li ><span onClick={() => {
									toggleViews("all");
								}} className={`cursor-pointer d-flex justify-content-between justify-content-md-start align-items-center gap-2 gap-4xl-4 text-dark fw-semibold border-bottom  border-4 py-2  ${(!isInWork && !isWaiting && !isPublish) ? "border-bottom border-black" : "border-white"} `}><span className="text-truncate" >All</span><Badge bg="dark">{!searchTerm ? articles.length : searchedArticles.length}</Badge></span></li>
								<li ><span onClick={() => {
									toggleViews("inwork");

								}} className={`cursor-pointer d-flex justify-content-between justify-content-md-start align-items-center gap-2 gap-4xl-4 text-dark fw-semibold border-bottom border-4 py-2 ${isInWork ? "border-bottom border-primary" : "border-white"}`}><span className="text-truncate" >In Progress</span><Badge bg="primary">{inWorkArticle.length}</Badge></span></li>
								<li><span onClick={() => {
									toggleViews("isWaiting");

								}} className={`cursor-pointer d-flex justify-content-between justify-content-md-start align-items-center gap-2 gap-4xl-4 text-dark fw-semibold border-bottom border-4 py-2 ${isWaiting ? "border-bottom border-secondary" : "border-white"}`}><span className="text-truncate"  >Waiting for review</span><Badge bg="secondary">{waitingForReview.length}</Badge></span></li>
								<li><span onClick={() => {
									toggleViews("isPublished")

								}} className={`cursor-pointer d-flex justify-content-between justify-content-md-start align-items-center gap-2 gap-4xl-4 text-dark fw-semibold border-bottom border-4 py-2 ${isPublish ? "border-bottom border-success" : "border-white"}`}><span className="text-truncate" > Published</span><Badge bg="success">{publishedArticle.length}</Badge></span></li>
							</ul>
						</HorizontalScrollbar>
					</div>
					<div className="d-flex align-items-center gap-1 gap-md-4 gap-xl-6 gap-3xl-8 ms-auto">
						<div className="d-flex gap-2 gap-md-3 me-1 me-sm-0">
							<span className={`cursor-pointer opacity-40 d-flex ${isGridView ? "active" : ""}`} onClick={() => setIsGridView(true)}><SvgHelper src={iconGrid} width='21' height="21" title="Grid" /></span>
							<span className={`cursor-pointer opacity-40 d-flex ${!isGridView ? "active" : ""}`} onClick={() => setIsGridView(false)}><SvgHelper src={iconList} width='21' height="21" title="List" /></span>
						</div>
						<Select onFocus={(e) => handleFocus(e)} classNamePrefix="select" className="select select-sm" placeholder="Sort by Date" onChange={(e) => handleSortChange(e)} options={options} defaultValue={options[1]} />
						<span className="d-md-none icon icon-category cursor-pointer border p-1 rounded-circle" onClick={() => toggleCategoryClass('item-category-open')}><SvgHelper src={iconSelect} width='28' height="28" title="Select" /></span>
					</div>
				</div>
				{
					!showLoader ?

						(isSearch && !searchedArticles.length ? <h1 className="text-break">No article found for "{searchTerm}"  </h1>
							: isGridView ?
								<HorizontalScrollbar className="item-grid d-flex flex-grow-1 overflow-auto gap-3 w-100 pb-sm-4 pb-xl-6 pb-3xl-8 h-100">
									{

										inWorkArticle.length && isInWorkItem ?
											<div className="item bg-light rounded-lg h-100 d-flex flex-column">
												<div className="item-title d-flex justify-content-between align-items-center gap-6">
													<h2 className="h6 fw-normal w-auto text-uppercase">In Progress</h2>
													<h2 className="h6 fw-normal w-auto fw-semibold">{inWorkArticle.length}</h2>
												</div>

												<div className="item-data flex-grow-1 overflow-auto">
													<Scrollbar>
														{
															inWorkArticle.map((ele, i) => {
																return (

																	<Card key={i} className="card bg-white border-0 shadow rounded-md mb-2 mb-sm-4 cursor-pointer" onClick={(e) => handleShow(e, ele)}>
																		<Card.Body className="py-2 px-2 py-sm-4 pt-3xl-5 pb-3xl-6 px-sm-4 d-flex flex-column flex-sm-row align-items-sm-center">
																			<figure className="picture rounded-xs mb-2 mb-sm-0 me-sm-2 me-3xl-5 text-break">
																				<img src={ele.thumbnail ?? defaultnewsImage} width="auto" height="auto" alt={ele.name} />
																			</figure>
																			<h3 className="h6 text-break">{ele.name}</h3>
																		</Card.Body>
																		<Card.Footer className="d-flex flex-column flex-sm-row justify-content-sm-between align-items-sm-center border-0 pt-0 px-2 px-sm-4 pb-3 pb-sm-4 pb-xl-6 gap-1 gap-sm-2 gap-3xl-4">
																			<span className="text-dark font-md text-uppercase text-truncate fw-semibold"><span className="opacity-40 pe-2 pe-3xl-3 fw-normal">Reporter:</span>{ele.reporter.name}</span>
																			{
																				ele.outputZip ?

																					<span className="text-primary d-flex align-items-center small gap-1 gap-3xl-3 download-button" onClick={() => downloadArticleZip(ele.id)}>
																						<u className="transition fw-semibold">Download</u>
																						<i className="d-flex icon-download">
																							<SvgHelper src={iconDownload} width='22' height="16" title="Download" />
																						</i>
																					</span> : ""
																			}
																		</Card.Footer>
																	</Card>

																)
															})
														}
													</Scrollbar>
												</div>
											</div>
											:
											""
									}
									{

										waitingForReview.length && isWaitingForReview ?
											<div className="item bg-light rounded-lg h-100 d-flex flex-column">
												<div className="item-title d-flex justify-content-between align-items-center gap-6">
													<h2 className="h6 fw-normal w-auto text-uppercase text-truncate">Waiting for review</h2>
													<h2 className="h6 fw-normal w-auto fw-semibold">{waitingForReview.length}</h2>
												</div>
												<div className="item-data flex-grow-1 overflow-auto">
													<Scrollbar>
														{
															waitingForReview.length > 0 ?
																waitingForReview.map((ele, i) => {
																	return (
																		<Card key={i} className="card bg-white border-0 shadow rounded-md mb-2 mb-sm-4 cursor-pointer" onClick={(e) => handleShow(e, ele)}>
																			<Card.Body className="py-2 px-2 py-sm-4 pt-3xl-5 pb-3xl-6 px-sm-4 d-flex flex-column flex-sm-row align-items-sm-center">
																				<figure className="picture rounded-xs mb-2 mb-sm-0 me-sm-2 me-3xl-5 text-break">
																					<img src={ele.thumbnail ?? defaultnewsImage} width="auto" height="auto" alt={ele.name} />
																				</figure>
																				<h3 className="h6 text-break">{ele.name}</h3>
																			</Card.Body>
																			<Card.Footer className="d-flex flex-column flex-sm-row justify-content-sm-between align-items-sm-center border-0 pt-0 px-2 px-sm-4 pb-3 pb-sm-4 pb-xl-6 gap-1 gap-sm-2 gap-3xl-4">
																				<span className="text-dark font-md text-uppercase text-truncate fw-semibold"><span className="opacity-40 pe-2 pe-3xl-3 fw-normal">Reporter:</span>{ele.reporter.name}</span>
																				{
																					ele.outputZip ?

																						<span className="text-primary d-flex align-items-center small gap-1 gap-3xl-3 download-button" onClick={() => downloadArticleZip(ele.id)}>
																							<u className="transition fw-semibold">Download</u>
																							<i className="d-flex icon-download">
																								<SvgHelper src={iconDownload} width='22' height="16" title="Download" />
																							</i>
																						</span> : ""
																				}
																			</Card.Footer>
																		</Card>
																	)
																}) :
																"no results found"
														}
													</Scrollbar>
												</div>
											</div>
											:
											""
									}
									{
										publishedArticle.length && isPublished ?
											<div className="item bg-light rounded-lg h-100 d-flex flex-column">
												<div className="item-title d-flex justify-content-between align-items-center gap-6">
													<h2 className="h6 fw-normal w-auto text-uppercase">Published</h2>
													<h2 className="h6 fw-normal w-auto fw-semibold">{publishedArticle.length}</h2>
												</div>
												<div className="item-data flex-grow-1 overflow-auto">
													<Scrollbar>
														{
															publishedArticle.length > 0 ?
																publishedArticle.map((ele, i) => {
																	return (
																		<Card key={i} className="card bg-white border-0 shadow rounded-md mb-2 mb-sm-4 cursor-pointer" onClick={(e) => handleShow(e, ele)}>
																			<Card.Body className="py-2 px-2 py-sm-4 pt-3xl-5 pb-3xl-6 px-sm-4 d-flex flex-column flex-sm-row align-items-sm-center">
																				<figure className="picture rounded-xs mb-2 mb-sm-0 me-sm-2 me-3xl-5 text-break">
																					{/* <img src={`../assets/images/${ele.thumbnail}`} width="auto" height="auto" alt="Work" /> */}
																					<img src={ele.thumbnail ?? defaultnewsImage} width="auto" height="auto" alt={ele.name} />
																				</figure>
																				<h3 className="h6 text-break">{ele.name}</h3>
																			</Card.Body>
																			<Card.Footer className="d-flex flex-column flex-sm-row justify-content-sm-between align-items-sm-center border-0 pt-0 px-2 px-sm-4 pb-3 pb-sm-4 pb-xl-6 gap-1 gap-sm-2 gap-3xl-4">
																				<span className="text-dark font-md text-uppercase text-truncate fw-semibold"><span className="opacity-40 pe-2 pe-3xl-3 fw-normal">Reporter:</span>{ele.reporter.name}</span>
																				{
																					ele.outputZip ?

																						<span className="text-primary d-flex align-items-center small gap-1 gap-3xl-3 download-button" onClick={() => downloadArticleZip(ele.id)}>
																							<u className="transition fw-semibold">Download</u>
																							<i className="d-flex icon-download">
																								<SvgHelper src={iconDownload} width='22' height="16" title="Download" />
																							</i>
																						</span> : ""
																				}
																			</Card.Footer>
																		</Card>
																	)
																}) : " no results found"
														}
													</Scrollbar>
												</div>
											</div> : ""
									}
								</HorizontalScrollbar> : <div className="pb-sm-4 pb-xl-6 pb-3xl-8 flex-grow-1 overflow-auto"><Scrollbar><NewsitemsListView isPublished={isPublished} isWaitingForReview={isWaitingForReview} isInWorkItem={isInWorkItem} waitingForReview={waitingForReview} inWorkArticle={inWorkArticle} publishedArticle={publishedArticle} handleShow={handleShow} /></Scrollbar></div>) : (<Loader now={undefined} />)
				}
			</section >

			<Modal className="modal-news" show={show} onHide={handleClose} centered size="lg">
				<NewsItemSummary articleId={articleId} setArticles={setArticles} data={cardData} setShow={setShow} setShow1={setShow1} textValue={'InWork'}
				/>
			</Modal>
			<Modal className="modal-video" show={show1} onHide={handleClose1} centered size="xl">
				<NewsItemsReviewVideo articleId={articleId} setShow1={setShow1} />
			</Modal>
		</>
	)
}


