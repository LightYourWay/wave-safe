interface filePickerOptions {
    title?: string;
    initialDirectory?: string;
    filter?: {
        items: filterItem[];
        index: number;
    };
    restoreDirectory?: boolean;
}

interface filterItem {
    name: string;
    extension: string;
}

function filterToString(filter: filterItem[]) {
    let filterString = "";
    filter.forEach((item) => {
        filterString += `${item.name}|${item.extension}|`;
    });
    filterString = filterString.slice(0, -1);
    return filterString;
}

const defaults = {
    title: "Select File",
    initialDirectory: "::{20D04FE0-3AEA-1069-A2D8-08002B30309D}",
    filter: {
        items: [
            {
                name: "All files",
                extension: "*.*"
            },
            {
                name: "Text files",
                extension: "*.txt"
            }
        ],
        index: 1
    },
    restoreDirectory: true
}

export async function selectFile(options: filePickerOptions) {
    return new Promise((resolve, reject) => {
        options.filter = options.filter || defaults.filter;
        options.restoreDirectory = options.restoreDirectory == undefined ? defaults.restoreDirectory : options.restoreDirectory;

        const psScript = `
        Function Select-FolderDialog
        {
            [System.Reflection.Assembly]::LoadWithPartialName("System.windows.forms") | Out-Null     
        
            $objForm = New-Object System.Windows.Forms.OpenFileDialog
            $objForm.Title = "${options.title || defaults.title}"
            $objForm.InitialDirectory = "${options.initialDirectory || defaults.initialDirectory}"
            ${options.filter ? "$objForm.Filter = \"" + filterToString(options.filter.items) + "\"" : ""}
            ${options.filter ? "$objForm.FilterIndex =" + options.filter.index : ""}
            $objForm.RestoreDirectory = ${options.restoreDirectory ? "$true" : "$false"}
            $Show = $objForm.ShowDialog()
            If ($Show -eq "OK")
            {
                Return $objForm.FileName
            }
            Else
            {
                Write-Error "Operation cancelled by user."
            }
        }
        
        $folder = Select-FolderDialog # the variable contains user folder selection
        write-host $folder
        `

        var spawn = require("child_process").spawn, child: any;
        child = spawn("powershell.exe", [psScript]);
        child.stdout.on("data", function (data: any) {
            resolve(data.toString());
        });
        child.stderr.on("data", function (data: any) {
            reject(data.toString());
        });
        child.stdin.end();
    });
}