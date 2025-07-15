class LayoutPreview extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    const response = await fetch('/content.html');
    const htmlText = await response.text();

    const template = document.createElement('template');
    template.innerHTML = htmlText;

    // Extract and load external CSS
    template.content.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const newLink = document.createElement('link');
      newLink.rel = 'stylesheet';
      newLink.href = link.href;
      this.shadowRoot.appendChild(newLink);
    });

    // Extract and load external JS
    template.content.querySelectorAll('script[src]').forEach(script => {
      const newScript = document.createElement('script');
      newScript.src = script.src;
      newScript.defer = true;
      this.shadowRoot.appendChild(newScript);
    });

    // Append internal styles and content
    const styles = template.content.querySelectorAll('style');
    styles.forEach(style => this.shadowRoot.appendChild(style.cloneNode(true)));

    const body = template.content.querySelector('body') || template.content;
    const dropzone = document.createElement('div');
    dropzone.id = 'dropzone';
    dropzone.style.minHeight = '300px';
    dropzone.style.background = '#f9f9f9';
    dropzone.style.padding = '1rem';

    this.shadowRoot.appendChild(dropzone);
    dropzone.append(...body.childNodes);

    dropzone.addEventListener('dragover', e => e.preventDefault());
    dropzone.addEventListener('drop', async e => {
      e.preventDefault();
      const type = e.dataTransfer.getData('text/plain');
      const compResponse = await fetch(`/${type}.html`);
      const compHTML = await compResponse.text();

      const wrapper = document.createElement('div');
      wrapper.classList.add('dropped');
      wrapper.innerHTML = compHTML;
      dropzone.appendChild(wrapper);
    });
  }
}

customElements.define('layout-preview', LayoutPreview);