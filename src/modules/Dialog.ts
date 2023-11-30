import {
  IFilePickerOptions,
  IFolderPickerOptions,
  IUserInputOptions,
} from "../interfaces/IDialog";
import {
  buildFilePickerDialog,
  buildFolderPickerDialog,
  buildUserInputDialog,
} from "../libraries/PS1ScriptBuilder";
import { psSpawner } from "./Helpers";

export async function selectFolder(options: IFolderPickerOptions) {
  return psSpawner(buildFolderPickerDialog(options));
}

export async function selectFile(options: IFilePickerOptions) {
  return psSpawner(buildFilePickerDialog(options));
}

export async function getUserInput(options: IUserInputOptions) {
  return psSpawner(buildUserInputDialog(options));
}
