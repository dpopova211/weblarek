import { Component } from '../base/Component';

interface IGallery {
    cards: HTMLElement[];
}

export class Gallery extends Component<IGallery> {
    constructor(container: HTMLElement) {
        super(container);
    }

    set cards(value: HTMLElement[]) {
        this.container.replaceChildren(...value);
    }
}