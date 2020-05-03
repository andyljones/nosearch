// The outline for this code is largely lifted from [this extension](https://github.com/ipython-contrib/jupyter_contrib_nbextensions/blob/6af8e5e84e4746476c5b476b7e38f63d7abb2064/src/jupyter_contrib_nbextensions/nbextensions/runtools/main.js)

define([
    'jquery',
    'base/js/events',
    'base/js/namespace'
], function($, events, Jupyter) {
    "use strict";

    const SEARCH = {
        cell_id: '',
        query: '',
    };

    function suggest(query, count) {
        return new Promise((resolve, reject) => {
            const callbacks = { shell: { reply: reply => { 
                const history = reply.content.history;
                if (history.length > 0) {
                    const index = count % history.length
                    resolve({text: history[index][2], index: index, length: history.length});
                } else {
                    resolve({text: '', index: index, length: 0});
                }
            }}};

            Jupyter.notebook.kernel.send_shell_message('history_request', {
                'output': false, 
                'raw': true, 
                'hist_access_type': 'search', 
                'pattern': query + '*', 
                'n': Math.max(100, count+1)}, 
            callbacks); 
        })
    }

    function search(inc) {
        const selected = Jupyter.notebook.get_selected_cell()
        const query = selected.get_text();

        if ((selected.cell_id != SEARCH.cell_id) | (query != SEARCH.query)) {
            SEARCH.cell_id = selected.cell_id;
            SEARCH.query = query;
            SEARCH.count = 0;
            SEARCH.text = 'no result';
        } else {
            SEARCH.count += inc;
        }

        suggest(query, SEARCH.count)
            .then(suggestion => {
                selected.output_area.clear_output();
                const content = query + ': #' + (suggestion.index+1) + '/' + suggestion.length + '\n' + suggestion.text;
                const json = {'output_type': 'stream', 'name': 'reverse-search', 'text': content} 
                selected.output_area.append_output(json); 
                SEARCH.text = suggestion.text
            })
    };

    function insert_result() {
        const selected = Jupyter.notebook.get_selected_cell()

        if (selected.cell_id == SEARCH.cell_id) {
            selected.set_text(SEARCH.text);
            selected.output_area.clear_output();
        } 
    }

    function add_actions() {

        var next = {
            icon: 'fa-comment-plus-square', // a font-awesome class used on buttons, etc
            help: 'Next reverse search result',
            help_index: 'zz',
            handler: () => search(+1)};
        var name = Jupyter.actions.register(next, 'next', 'nosearch');
        Jupyter.keyboard_manager.edit_shortcuts.add_shortcut('ctrl-r', name);

        var prev = {
            icon: 'fa-comment-plus-square', // a font-awesome class used on buttons, etc
            help: 'Previous reverse search result',
            help_index: 'zz',
            handler: () => search(-1)};
        var name = Jupyter.actions.register(prev, 'prev', 'nosearch');
        Jupyter.keyboard_manager.edit_shortcuts.add_shortcut('ctrl-shift-r', name);

        var insert = {
            icon: 'fa-comment-plus-square', // a font-awesome class used on buttons, etc
            help: 'Insert search result',
            help_index: 'zz',
            handler: insert_result};
        var name = Jupyter.actions.register(insert, 'insert', 'nosearch');
        Jupyter.keyboard_manager.edit_shortcuts.add_shortcut('ctrl-alt-r', name);
    }

    function load_extension() {
        if (Jupyter.notebook._fully_loaded) {
            add_actions();
        } else {
            events.one('notebook_loaded.Notebook', add_actions);
        }
    }

    return {
        load_ipython_extension: load_extension,
        load_jupyter_extension: load_extension
    };
});
