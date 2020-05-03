// The outline for this code is largely lifted from [this extension](https://github.com/ipython-contrib/jupyter_contrib_nbextensions/blob/6af8e5e84e4746476c5b476b7e38f63d7abb2064/src/jupyter_contrib_nbextensions/nbextensions/runtools/main.js)

define([
    'jquery',
    'base/js/events',
    'base/js/namespace'
], function($, events, Jupyter) {
    "use strict";

    const SEARCHES = {};

    function add_start_action() {
        const handler = function () {
            const cell = Jupyter.notebook.get_selected_cell()
            const text = cell.get_text();
            console.log('Sending a search request for ' + text);
            const callbacks = { shell: { reply: reply => { 
                        console.log('Got a search response');
                        const history = reply.content.history;
                        if (history) {
                            cell.set_text(history[0][2]); }}}};
            Jupyter.notebook.kernel.send_shell_message('history_request', {
                'output': false, 
                'raw': true, 
                'hist_access_type': 'search', 
                'pattern': text + '*', 
                'n': 1}, callbacks); 
        };

        var action = {
            icon: 'fa-comment-plus-square', // a font-awesome class used on buttons, etc
            help    : 'Start reverse search',
            help_index : 'zz',
            handler : handler};

        console.log('registering new')
        const name = Jupyter.actions.register(action, 'start', 'nosearch');
        Jupyter.keyboard_manager.edit_shortcuts.add_shortcut('ctrl-r', name);
    }

    function load_extension() {
        if (Jupyter.notebook._fully_loaded) {
            add_start_action();
        } else {
            events.one('notebook_loaded.Notebook', add_start_action);
        }
    }

    return {
        load_ipython_extension: load_extension,
        load_jupyter_extension: load_extension
    };
});
