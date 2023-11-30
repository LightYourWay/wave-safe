interface IDialogOptions {
  title?: string;
}

export interface IFolderPickerOptions extends IDialogOptions {
  initialDirectory?: string;
}

export interface IFilePickerOptions extends IFolderPickerOptions {
  filter?: {
    items: IFilterItem[];
    index: number;
  };
  restoreDirectory?: boolean;
}

export interface IUserInputOptions extends IDialogOptions {
  message?: string;
  initialValue?: string;
}

export interface IFilterItem {
  name: string;
  extension: string;
}
