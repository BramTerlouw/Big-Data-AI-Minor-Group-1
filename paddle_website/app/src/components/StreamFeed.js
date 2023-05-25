class StreamFeed extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super();
        this.attachShadow({mode: "open"});


        this._$route = null;
        this._$token = null;
        this._$program_id = null;
        // write element functionality in here
    }

    style(){
        return `
        <style>
           /*add style here   */
        </style>    
       `;
    }

    content(){
        this.shadowRoot.innerHTML =`
            ${this.style()}
            <div>
                Some HTML
            </div>
        `

        // this.shadowRoot.querySelector('.add-to-cart').addEventListener('click', this.sendRequestForm.bind(this))
    }

    connectedCallback(){
        this.content();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this["_$"+ name] = newValue;
        }
    }

    static get observedAttributes() {
        return ["route", "token", "program_id"];
    }

}

export default StreamFeed;
