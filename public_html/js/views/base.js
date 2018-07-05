const elements = {
    loadBody: document.querySelector('#loadBody')
};

const elementStrings = {
    loader: 'loader'
};

const renderLoader = parent => {
    const loader = `
        <div class="${elementStrings.loader}">
            <svg>
                <use href="images/icons.svg#icon-cw"></use>
            </svg>
        </div>
    `;
    parent.insertAdjacentHTML('afterbegin', loader);
};

const clearLoader = () => {
    const loader = document.querySelector(`.${elementStrings.loader}`);
    if (loader) loader.parentElement.removeChild(loader);
};

module.exports = {elements, elementStrings, renderLoader, clearLoader}