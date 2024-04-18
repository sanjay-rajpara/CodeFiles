import { useReducer, useContext, createContext, Dispatch, ReactNode, useEffect, useState } from "react";
const stepperStateKey = 'stepperState';

interface StepperStateModel {
  currentStep: number;
  // validation
  readonly totalSteps: 4;
  readonly lowestStep: 1;
}

export interface PageValidation { }

interface StepperActionsModel {
  step: "previous" | "next";
  pageValidation?: {
    articleInformation: any
  }
}

const StepperContext = createContext<
  | {
    stepperState: StepperStateModel;
    stepperDispatch: Dispatch<StepperActionsModel>;

    setArticleData: any;
    articleData: any
  }
  | undefined
>(undefined);

function manageSteps(state: StepperStateModel, to: 1 | -1): number {
  if (to > 0) {
    if (state.currentStep >= state.totalSteps) return state.currentStep;
  }
  if (to < 0 && (state.currentStep <= state.lowestStep)) return state.currentStep;
  return state.currentStep + to;
}

const stepperReducer = (
  state: StepperStateModel,
  action: StepperActionsModel
) => {
  switch (action.step) {
    case "next":
      return { ...state, currentStep: manageSteps(state, 1) };
    case "previous":
      return { ...state, currentStep: manageSteps(state, -1) };
  }
};

export const StepperProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // let lsState = localStorage.getItem(stepperStateKey);
  // let stepperState = lsState ? JSON.parse(lsState) : { currentStep: 1, totalSteps: 4, lowestStep: 1 };
  let stepperState: StepperStateModel = { currentStep: 1, totalSteps: 4, lowestStep: 1 };
  const [state, dispatch] = useReducer(stepperReducer, stepperState);
  const [articleData, setArticleData] = useState({
    articleSettingsData: null,
    editorialData: null,
    videoSettingsData: null
  });

  // useEffect(() => {
  //   console.log(articleData);
  // }, [articleData]);

  return (
    <StepperContext.Provider value={{ stepperState: state, stepperDispatch: dispatch, setArticleData: setArticleData, articleData: articleData }}>
      {children}
    </StepperContext.Provider>
  );
};



export const useStepper = () => {
  const context = useContext(StepperContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalContextProvider');
  }
  return context;
};
