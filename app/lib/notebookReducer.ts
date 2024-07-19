type TextBox = {
    text: string;
    id: number;
    wordCount: number;
    runResult: string;
    isLoading: boolean;
  };
  
type State = {
  textBoxes: TextBox[];
  selectedIndex: number | null;
};

type Action =
  | { type: 'ADD_TEXTBOX' }
  | { type: 'DELETE_TEXTBOX'; index: number }
  | { type: 'UPDATE_TEXT'; index: number; text: string; wordCount: number }
  | { type: 'SET_SELECTED_INDEX'; index: number | null }
  | { type: 'RUN_TEXTBOX_START'; index: number }
  | { type: 'RUN_TEXTBOX_SUCCESS'; index: number; result: string }
  | { type: 'RUN_TEXTBOX_FAILURE'; index: number; error: string };

const initialState: State = {
  textBoxes: [],
  selectedIndex: null,
};

const notebookReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TEXTBOX':
      return {
        ...state,
        textBoxes: [
          ...state.textBoxes,
          { text: '', id: Date.now(), wordCount: 0, runResult: '', isLoading: false },
        ],
        selectedIndex: state.textBoxes.length,
      };
    case 'DELETE_TEXTBOX':
      const newTextBoxes = state.textBoxes.filter((_, i) => i !== action.index);
      return {
        ...state,
        textBoxes: newTextBoxes,
        selectedIndex: state.selectedIndex === action.index ? null : state.selectedIndex,
      };
    case 'UPDATE_TEXT':
      return {
        ...state,
        textBoxes: state.textBoxes.map((box, i) =>
          i === action.index ? { ...box, text: action.text, wordCount: action.wordCount } : box
        ),
      };
    case 'SET_SELECTED_INDEX':
      return {
        ...state,
        selectedIndex: action.index,
      };
    case 'RUN_TEXTBOX_START':
      return {
        ...state,
        textBoxes: state.textBoxes.map((box, i) =>
          i === action.index ? { ...box, isLoading: true } : box
        ),
      };
    case 'RUN_TEXTBOX_SUCCESS':
      return {
        ...state,
        textBoxes: state.textBoxes.map((box, i) =>
          i === action.index ? { ...box, isLoading: false, runResult: action.result } : box
        ),
      };
    case 'RUN_TEXTBOX_FAILURE':
      return {
        ...state,
        textBoxes: state.textBoxes.map((box, i) =>
          i === action.index ? { ...box, isLoading: false, runResult: action.error } : box
        ),
      };
    default:
      return state;
  }
};

export { notebookReducer, initialState}
export type {TextBox, State, Action };