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
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    
    $form = New-Object System.Windows.Forms.Form
    $form.Text = '${title}'
    $form.Size = New-Object System.Drawing.Size(350,150)
    $form.StartPosition = 'CenterScreen'
    $form.ShowIcon = $false
    
    $okButton = New-Object System.Windows.Forms.Button
    $okButton.Location = New-Object System.Drawing.Point(245,75)
    $okButton.Size = New-Object System.Drawing.Size(75,23)
    $okButton.Text = 'OK'
    $okButton.DialogResult = [System.Windows.Forms.DialogResult]::OK
    $form.AcceptButton = $okButton
    $form.Controls.Add($okButton)
    
    $cancelButton = New-Object System.Windows.Forms.Button
    $cancelButton.Location = New-Object System.Drawing.Point(160,75)
    $cancelButton.Size = New-Object System.Drawing.Size(75,23)
    $cancelButton.Text = 'Cancel'
    $cancelButton.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
    $form.CancelButton = $cancelButton
    $form.Controls.Add($cancelButton)
    
    $label = New-Object System.Windows.Forms.Label
    $label.Location = New-Object System.Drawing.Point(10,20)
    $label.Size = New-Object System.Drawing.Size(280,20)
    $label.Text = '${message}'
    $form.Controls.Add($label)
    
    $textBox = New-Object System.Windows.Forms.TextBox
    $textBox.Location = New-Object System.Drawing.Point(10,40)
    $textBox.Size = New-Object System.Drawing.Size(310,20)
    $textBox.Text = '${defaultValue}'
    $form.Controls.Add($textBox)
    
    $form.Topmost = $true
    $form.Add_Shown({$textBox.Select()})
  
    if ($form.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
      Write-Host $textBox.Text
    } else {
      Write-Error "Operation cancelled by user."
    }
  `;
}

export function buildFolderPickerDialog(options: IFolderPickerOptions) {
  const defaults = {
    title: "Select Folder",
    initialDirectory: "c:\\",
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
    ${
      options.initialDirectory
        ? ""
        : "$selectFolderDialog.RootFolder = 'MyComputer'"
    }

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
