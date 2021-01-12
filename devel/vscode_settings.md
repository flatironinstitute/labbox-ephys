## Automatic organizing of typescript imports

Use the following in `~/.config/Code/User/settings.json` to achieve automatic organizing of typescript imports:

```
{
    ...
    "[typescript]": {
        "editor.codeActionsOnSave": {
            "source.organizeImports": true
        }
    },
    "[typescriptreact]": {
        "editor.codeActionsOnSave": {
            "source.organizeImports": true
        }
    }
}
```

See: https://eshlox.net/2019/12/02/vscode-automatically-organize-typescript-imports