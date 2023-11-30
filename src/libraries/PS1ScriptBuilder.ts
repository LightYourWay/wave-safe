import {
  IFilePickerOptions,
  IFolderPickerOptions,
  IUserInputOptions,
} from "../interfaces/IDialog";
import { filterToString } from "../modules/Helpers";

export function buildUserInputDialog(options: IUserInputOptions) {
  const defaults: IUserInputOptions = {
    title: "User Input",
    message: "Enter a value",
    initialValue: "",
  };

  const message = options.message || defaults.message;
  const title = options.title || defaults.title;
  const defaultValue = options.initialValue || defaults.initialValue;

  return `
    Add-Type -AssemblyName Microsoft.VisualBasic
    
    $inputText = [Microsoft.VisualBasic.Interaction]::InputBox("${message}", "${title}", "${defaultValue}")

    If ($inputText -ne "")
    {
      Write-Host $inputText
    }
    Else
    {
      Write-Error "Operation cancelled by user."
    }
  `;
}

export function buildFolderPickerDialog(options: IFolderPickerOptions) {
  const defaults = {
    title: "Select Folder",
    initialDirectory: "::{20D04FE0-3AEA-1069-A2D8-08002B30309D}",
  };

  const title = options.title || defaults.title;
  const initialDirectory =
    options.initialDirectory || defaults.initialDirectory;

  return `
    [System.Reflection.Assembly]::LoadWithPartialName("System.windows.forms") | Out-Null
    [System.Windows.Forms.Application]::EnableVisualStyles()

    $selectFolderDialog = New-Object System.Windows.Forms.FolderBrowserDialog
    $selectFolderDialog.Description = "${title}"
    $selectFolderDialog.SelectedPath = "${initialDirectory}"

    If ($selectFolderDialog.ShowDialog() -eq "OK")
    {
      Write-Host $selectFolderDialog.SelectedPath
    }
    Else
    {
      Write-Error "Operation cancelled by user."
    }
  `;
}

export function buildFilePickerDialog(options: IFilePickerOptions) {
  const defaults = {
    title: "Select File",
    initialDirectory: "::{20D04FE0-3AEA-1069-A2D8-08002B30309D}",
    filter: {
      items: [
        {
          name: "All files",
          extension: "*.*",
        },
        {
          name: "Text files",
          extension: "*.txt",
        },
      ],
      index: 1,
    },
    restoreDirectory: true,
  };

  const title = options.title || defaults.title;
  const initialDirectory =
    options.initialDirectory || defaults.initialDirectory;
  const filter = options.filter || defaults.filter;
  const restoreDirectory =
    options.restoreDirectory == undefined
      ? defaults.restoreDirectory
      : options.restoreDirectory;

  return `
    [System.Reflection.Assembly]::LoadWithPartialName("System.windows.forms") | Out-Null
    [System.Windows.Forms.Application]::EnableVisualStyles()

    $selectFileDialog = New-Object System.Windows.Forms.OpenFileDialog
    $selectFileDialog.Title = "${title}"
    $selectFileDialog.InitialDirectory = "${initialDirectory}"
    ${
      filter
        ? '$selectFileDialog.Filter = "' + filterToString(filter.items) + '"'
        : ""
    }
    ${filter ? "$selectFileDialog.FilterIndex =" + filter.index : ""}
    $selectFileDialog.RestoreDirectory = ${
      restoreDirectory ? "$true" : "$false"
    }

    If ($selectFileDialog.ShowDialog() -eq "OK")
    {
      Write-Host $selectFileDialog.FileName
    }
    Else
    {
      Write-Error "Operation cancelled by user."
    }
  `;
}
