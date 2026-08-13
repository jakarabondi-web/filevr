import type { QueuedFile } from "@/types";
import type { FileErrorCode } from "@/lib/validation/file";

export interface UploadQueueState {
  files: QueuedFile[];
}

export type UploadQueueAction =
  | { type: "ADD_FILES"; files: QueuedFile[] }
  | { type: "REMOVE_FILE"; id: string }
  | { type: "SET_PROGRESS"; id: string; progress: number }
  | { type: "SET_STATUS"; id: string; status: QueuedFile["status"] }
  | { type: "SET_UPLOADED"; id: string; serverFileId: string }
  | { type: "SET_ERROR"; id: string; errorCode: FileErrorCode; errorMessage: string }
  | { type: "RETRY"; id: string }
  | { type: "RESET" };

export const initialUploadQueueState: UploadQueueState = { files: [] };

export function uploadQueueReducer(
  state: UploadQueueState,
  action: UploadQueueAction
): UploadQueueState {
  switch (action.type) {
    case "ADD_FILES":
      return { files: [...state.files, ...action.files] };
    case "REMOVE_FILE":
      return { files: state.files.filter((f) => f.id !== action.id) };
    case "SET_PROGRESS":
      return {
        files: state.files.map((f) =>
          f.id === action.id ? { ...f, progress: action.progress } : f
        ),
      };
    case "SET_STATUS":
      return {
        files: state.files.map((f) =>
          f.id === action.id ? { ...f, status: action.status } : f
        ),
      };
    case "SET_UPLOADED":
      return {
        files: state.files.map((f) =>
          f.id === action.id
            ? { ...f, status: "uploaded", progress: 100, serverFileId: action.serverFileId }
            : f
        ),
      };
    case "SET_ERROR":
      return {
        files: state.files.map((f) =>
          f.id === action.id
            ? { ...f, status: "error", errorCode: action.errorCode, errorMessage: action.errorMessage }
            : f
        ),
      };
    case "RETRY":
      return {
        files: state.files.map((f) =>
          f.id === action.id
            ? {
                ...f,
                status: "pending",
                progress: 0,
                serverFileId: undefined,
                errorCode: undefined,
                errorMessage: undefined,
              }
            : f
        ),
      };
    case "RESET":
      return initialUploadQueueState;
    default:
      return state;
  }
}
