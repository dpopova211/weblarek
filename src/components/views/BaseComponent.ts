import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';

export abstract class ViewComponent<T> extends Component<T> {
    constructor(container: HTMLElement) {
        super(container);
    }

    protected setText(element: HTMLElement, value: string) {
        if (element) {
            element.textContent = value;
        }
    }

    protected setDisabled(element: HTMLElement, state: boolean) {
        if (element) {
            if (state) {
                element.setAttribute('disabled', 'disabled');
            } else {
                element.removeAttribute('disabled');
            }
        }
    }

    protected ensureElement<E extends HTMLElement>(selector: string): E {
        return ensureElement<E>(selector, this.container);
    }
    
    get element(): HTMLElement {
        return this.container;
    }
}