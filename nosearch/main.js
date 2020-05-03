// The outline for this code is largely lifted from [this extension](https://github.com/ipython-contrib/jupyter_contrib_nbextensions/blob/6af8e5e84e4746476c5b476b7e38f63d7abb2064/src/jupyter_contrib_nbextensions/nbextensions/runtools/main.js)

define([
    'jquery',
    'base/js/events',
    'base/js/namespace'
], function($, events, Jupyter) {
    "use strict";

    let CACHE = {};

    function fetch_history(query, inc, cell_id) {
        const previous = CACHE;
        if ((query != previous.query) | (cell_id != previous.cell_id)) {
            return new Promise((resolve, reject) => {
                const callbacks = { shell: { reply: reply => { 
                    const next = {
                        cell_id: cell_id,
                        query: query, 
                        history: reply.content.history, 
                        count: 0}
                    CACHE = next;
                    resolve(next);
                }}};

                Jupyter.notebook.kernel.send_shell_message('history_request', {
                    'output': false, 
                    'raw': true, 
                    'hist_access_type': 'search', 
                    'pattern': query + '*', 
                    'n': 100}, 
                callbacks); 
            });
        } else {
            return new Promise((resolve, reject) => { 
                const next = Object.assign({}, previous); 
                next.count += inc;
                CACHE = next;
                resolve(next); });
        }
    }

    function search(inc) {
        const selected = Jupyter.notebook.get_selected_cell()
        const query = selected.get_text();
        fetch_history(query, inc, selected.cell_id).then(
            cache => {
                let index = 0, one_index = 0, text = '';
                if (cache.history.length) {
                    index = cache.count % cache.history.length;
                    one_index = index + 1;
                    text = cache.history[index][2];
                }
                const content = query + ': ' + one_index + '/' + cache.history.length + '\n' + text;
                const json = {'output_type': 'stream', 'name': 'reverse-search', 'text': content} 
                selected.output_area.clear_output();
                selected.output_area.append_output(json); 
            }
        )
    };

    function insert_result() {
        const selected = Jupyter.notebook.get_selected_cell()
        const cache = CACHE;
        if (selected.cell_id == cache.cell_id) {
            const index = cache.count % cache.history.length;
            const text = cache.history[index][2];

            selected.set_text(text);
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
        Jupyter.keyboard_manager.command_shortcuts.add_shortcut('ctrl-r', name);

        var prev = {
            icon: 'fa-comment-plus-square', // a font-awesome class used on buttons, etc
            help: 'Previous reverse search result',
            help_index: 'zz',
            handler: () => search(-1)};
        var name = Jupyter.actions.register(prev, 'prev', 'nosearch');
        Jupyter.keyboard_manager.edit_shortcuts.add_shortcut('ctrl-shift-r', name);
        Jupyter.keyboard_manager.command_shortcuts.add_shortcut('ctrl-shift-r', name);

        var insert = {
            icon: 'fa-comment-plus-square', // a font-awesome class used on buttons, etc
            help: 'Insert search result',
            help_index: 'zz',
            handler: insert_result};
        var name = Jupyter.actions.register(insert, 'insert', 'nosearch');
        Jupyter.keyboard_manager.edit_shortcuts.add_shortcut('ctrl-alt-r', name);
        Jupyter.keyboard_manager.command_shortcuts.add_shortcut('ctrl-alt-r', name);
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
