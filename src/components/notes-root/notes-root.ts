import "../notes-group/notes-group.js";

export class Notes extends HTMLElement{
    private shadow = this.attachShadow({ mode: "open" });

    private div!: HTMLDivElement;

    async connectedCallback(){

        const [html, css] = await Promise.all([
            fetch(new URL("./notes-root.html", import.meta.url)).then(r => r.text()),
            fetch(new URL("./notes-root.css", import.meta.url)).then(r => r.text())
        ]);

        this.shadow.innerHTML = `<style>${css}</style>${html}`;

        this.initializeHTMLElements();

        const groupEl = document.createElement("notes-group");
        this.div.appendChild(groupEl);
    }

    private initializeHTMLElements(){
        const div = this.shadow.querySelector<HTMLDivElement>("#group");

        if (!div) {
            throw new Error("Missing #group in notes-root.html");
        }

        this.div = div;
    }

}
customElements.define("notes-root", Notes);