import type { NotesGroup } from "../notes-group/notes-group.js";
import { Notes } from "../notes/notes.js";

export class NotesButton extends HTMLElement{
    //fields
    //for the DOM
    private shadow = this.attachShadow({ mode: "open" });
    private group!: NotesGroup;
    private titleNotes: string = 'notes';
    private description: string = "";
    private important: boolean = false;

    private initialized: boolean = false;

    private titleH1!: HTMLHeadingElement;
    private descH4!: HTMLHeadingElement;

    private notes!: Notes;
    private dateMade!: Date;
    private dateUpdated!: Date;

    //runs when added
    async connectedCallback(){
        if(this.initialized) return;
        this.initialized = true;

        //load html and css
        const [html, css] = await Promise.all([
            fetch(new URL("./notes-button.html", import.meta.url)).then(r => r.text()),
            fetch(new URL("./notes-button.css", import.meta.url)).then(r => r.text())
        ]);

        //connects css
        this.shadow.innerHTML = `<style>${css}</style>${html}`;

        this.addEventListener("click", () => {
            console.log("clicked");
        });

        this.initializeHTMLElements();

        //this.notes = new Notes();
        this.dateMade = new Date();
        this.dateUpdated = new Date();

        this.shadow.getElementById("delete")!.addEventListener("click", () => this.delete());

        this.update();
    }
    
    //connects variables to html
    initializeHTMLElements(): void{
        const titleH1 = this.shadow.querySelector<HTMLHeadingElement>("#title-notes");
        const descH4 = this.shadow.querySelector<HTMLHeadingElement>("#description");

        if (!titleH1 || !descH4) {
            throw new Error("Missing #title-notes or #description in notes-button.html");
        }

        this.titleH1 = titleH1;
        this.descH4 = descH4;
    }

    //getters
    public get getTitleNotes(){
        return this.titleNotes;
    }

    public get getDescription(){
        return this.description;
    }

    public get getImportant(){
        return this.important;
    }

    public getDateMade(){
        return this.dateMade;
    }

    public getDateUpdated(){
        return this.dateUpdated;
    }

    //setters
    public set setTitleNotes(t: string){
        console.log(t);
        this.titleNotes = t;
        this.update();
    }

    public set setDescription(d: string){
        console.log(d)
        this.description = d;
        this.update();
    }

    public set setImportant(i: boolean){
        this.important = false;
        this.update();
    }

    public set setNotesGroup(g: NotesGroup){
        this.group = g;
        this.update();
    }

    public set setDateUpdated(d: Date){
        this.dateUpdated = d;
        this.update();
    }

    //methods
    private update(){
        if (!this.initialized) return;
        this.titleH1.textContent = this.titleNotes;
        this.descH4.textContent = this.description;

    }
    
    public delete(){
        this.group.removeNotesButton(this);
    }
}

customElements.define("notes-button", NotesButton);