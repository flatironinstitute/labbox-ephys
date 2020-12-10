## misc development tips

### Snippets

```
Regarding custom snippets:
you can explore: labbox-snippets.code-snippets
The prefix of each snippet is what you type inside the editor to pull up the option. Then the tab stops will guide you to fill in the templated variables.
So, to create a new extension do the following
make new directory and file: extensions/extname/extname.tsx
edit extname.txt and start typing "extensio..."
the snippet will pop up. You just fill in the name of the extension "extname" and you are done.
Do code generation and you have a new extension.
There is also a container prefix for making a new container (with StateProps, DispatchProps, OwnProps, etc)
There is also a component prefix for making a typescript function component inside a new file.
```

```
making your own snippet:
I use the vscode extension: nsfilho.tosnippet
You are writing some code and you say, 'self, I think I've typed this before, I want to make a snippet'
You highlight the code and run the command "Convert to snippet"
You answer some questions
In the output window you see the json snippet in exactly as it needs to be formatted to go into the snippets config file (edited) 
Then manually edit to make the tab stops
```

### Markdown code generation

```
some widgets render markdown via the <Markdown ... /> component. The most convenient thing would be
import markdownText from './markdown.md'
But that's problematic. After trying a bunch of things with various levels of success, I decided to use code generation and the following solution:
whateverfile.md is the source
code generation produces whateverfile.md.gen.ts
Then we
import markdownText from './markdown.md.gen'
```
