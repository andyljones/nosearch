Reverse search for Jupyter notebook cells, across your whole history.

Hit Ctrl+R in Jupyter Notebook to do a reverse history search. Ctrl+R again to move back further; Ctrl+Shift+R to move forward toward the present. Ctrl+E to accept the recovered command. 

(Ctrl+E because Enter is used by the regular terminal, and it's next to R on QWERTY)

### Dev Install
Clone the repo, then install it with:
```
jupyter nbextension install nosearch/nosearch
jupyter nbextension enable nosearch
```
