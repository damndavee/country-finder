class Country {
    constructor() {
        this.state = {
            alphabet: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
            url: `https://restcountries.eu/rest/v2`,
            countries: [],
            pages: null,
            countriesOnPage: 15,
            page: 1,
            displayedPages: 5,
            isPaginationLoaded: false,
        }
        
        this.desktopViewport = window.matchMedia("screen and (min-width: 540px)");
        this.smallViewport = window.matchMedia("screen and (max-width: 640px)");
        this.smallDesktopViewport = window.matchMedia("screen and (max-width: 960px)");

        this.letters = document.querySelector('#letters');
        this.hamburger = document.querySelector('#hamburger');
        this.navigation = document.querySelector('#navigation');
        this.showAllCountries = document.querySelector('#show-countries');
        this.container = document.querySelector('#container');
        this.paginationContainer = document.querySelector('#pagination');
        this.searchCountry = document.querySelector('#search-country');
        this.showCountry = document.querySelector('#show-country');

    }

    generateLetters = () => {
        // RWD
        this.letters.innerHTML = '';
        // RWD
        
        this.state.alphabet.forEach(letter => {
            const newLetter = document.createElement('div');
            newLetter.classList = 'letter';
            newLetter.innerText = letter;
            newLetter.dataset.letter = letter;
            this.letters.appendChild(newLetter);
        })
    }

    // RWD
    generateSelectAlphabet = () => {
        this.letters.innerHTML = '';
        const select = document.createElement('select');

        this.state.alphabet.forEach(letter => {
            const option = document.createElement('option');
            option.value = letter;
            option.innerHTML = letter;
            select.appendChild(option);
        })

        this.letters.appendChild(select);
    }

    generateAlphabetDependedOnResolution = isDesktop => {
        isDesktop ? this.generateLetters() : this.generateSelectAlphabet();
    }

    // toggleCountriesPerPage(resolution) {
    //     switch(resolution) {
    //         case 'x-small': {
    //             this.state.countriesOnPage = 15;
    //             break;
    //         }
    //     }
    // }
    // RWD

    clearContainer = () => {
        this.container.innerHTML = '';
    }

    toggleHamburgerAndNavigation = () => {
        this.hamburger.classList.toggle('hamburger--active');
        this.navigation.classList.toggle('navigation--active');
    }

    getAllCountries = async () => {
        let {url} = this.state;
        const res = await fetch(`${url}/all`);
        const data = await res.json();
        this.state.countries = data;
    }

    getCountryTemplate(container, name, flag) {
        const template = `
        <div class="country">
            <div class="country__image">
                <img src="${flag}" alt="${name}" class="country__flag">
            </div>
            <div class="country__details">
                <h2 class="country__name">${name}</h2>
                <button data-country="${name}" class="country__btn">Details</button>
            </div>
        </div>
        `;
    
        return container.innerHTML += template;
    }

    getPagination(data, page, countriesOnPage) {
        let start = (page - 1) * countriesOnPage;
        let end = start + countriesOnPage;
        let trimmedData = data.slice(start, end);
        let pages = Math.ceil(data.length / countriesOnPage); 

        this.state.pages = pages;

        return {
            'data': trimmedData,
            'pages': pages
        }
    }

    loadCountries =  () => {
        this.paginationContainer.style.display = 'flex';
        const data = this.getPagination(this.state.countries, this.state.page, this.state.countriesOnPage);

        this.clearContainer();
        
        data.data.forEach( ({name, flag} = country) => {
            this.getCountryTemplate(this.container, name, flag);
        });

        if(!this.state.isPaginationLoaded) this.getPaginationsButtons();
    }

    getPaginationsButtons() {

        const btns = [document.createElement('button'), document.createElement('button')];
        const btnsDetails = [
            {value: -1, text: 'Previous', class: 'pagination__prev-btn'}, 
            {value: 1, text: 'Next', class: 'pagination__next-btn'}
        ];

        const currentPageContainer = document.createElement('div');

        btns.map((btn , index)=> {
            btn.value = btnsDetails[index].value;
            btn.className = `btn ${btnsDetails[index].class}`;
            btn.innerHTML = btnsDetails[index].text;
            this.paginationContainer.appendChild(btn);
        })

        btns[0].disabled = true;

        currentPageContainer.classList.add('pagination__current-page');
        currentPageContainer.innerHTML = `${this.state.page} / ${this.state.pages}`;
        this.paginationContainer.appendChild(currentPageContainer);

        if(!this.state.isPaginationLoaded) {
            this.paginationContainer.addEventListener('click', (e) => {
                if(e.target.value) {
                    this.clearContainer();
                    this.state.page += (+e.target.value);
                    this.loadCountries();
                    currentPageContainer.innerHTML = `${this.state.page} / ${this.state.pages}`;

                    this.state.page === 1 ? btns[0].disabled = true : btns[0].disabled = false;
                    this.state.page === this.state.pages ? btns[1].disabled = true : btns[1].disabled = false;
                }
            })
            this.state.isPaginationLoaded = true;
            
        }

    }

    selectCountryByFirstLetter = e => {
        this.paginationContainer.style.display = 'none';
        const letter = e.target.dataset.letter;
        if(letter) {
            this.container.innerHTML = ''
            this.state.countries.forEach(({name, flag} = country) => {
                let lowerName = name.toLowerCase();

                if(lowerName.includes('å')) {
                    lowerName = lowerName.replace('å', 'a');
                }
                const firstLetter = lowerName[0];

                if(firstLetter === letter) {
                    this.getCountryTemplate(this.container, name, flag)
                }
                
            })
        }
    }

    getCountryByItsName = async () => {
        this.clearContainer();
        const {url} = this.state;
        const country = this.searchCountry.value;
    
        if(country) {
            const res = await fetch(`${url}/name/${country}`);
            const data = await res.json();

            data.forEach(({name, flag} = data) => this.getCountryTemplate(this.container, name, flag));
        }
        this.searchCountry.value = '';
    }

    getDatasetFromCountry(e) {
        const countryName = e.target.dataset.country;
        if(countryName) return countryName;
    }

    showDetailedInfoAboutCountry = e => {
        const countryDataset = this.getDatasetFromCountry(e);
        
        if(countryDataset) {
            this.state.countries.forEach(country => {
                if(country.name === countryDataset) {
                    console.log(country);
                    this.detailInfoTemplate(this.container, country);
                }
            })
        };
    }

    closeDetailedInfoAboutCountry = e => {
        const target = e.target.dataset.close;

        if(target) {
            const details = e.target.parentNode.parentNode;
            e.target.parentNode.parentNode.parentNode.removeChild(details);
        } 
    }

    detailInfoTemplate(container, country) {
        const template = document.createElement('div');
        template.className = 'details';
        template.innerHTML = `
            <div class="details__container">
                <button class="details__btn-close" data-close="close">X</button>
                <span>${country.name}</span></br>
                <span>${country.alpha2Code}</span></br>
                <span>${country.alpha3Code}</span></br>
                <span>${country.altSpellings.map(el => `<span>${el}</span>`)}</span></br>
                <span>${country.area}</span></br>
                <span>${country.borders.map(border => `<span>${border}</span>`)}</span></br>
                <span>${country.capital}</span></br>
                <span>${country.cioc}</span></br>
                <span>${country.currencies.map(cur => `<span>${cur.code} ${cur.name} ${cur.symbol}</span>`)}</span></br>
                <span>${country.demonym}</span></br>
                <span>${country.flag}</span></br>
                <span>${country.gini}</span></br>
                <span>${country.languages.map(lang => `<span>${lang.name} ${lang.nativeName}</span>`)}</span></br>
                
                <span>${country.nativName}</span>
                <span>${country.numericCode}</span>
                <span>${country.population}</span>
                <span>${country.region}</span>
                <span>${country.regionalBlocks}</span>
                <span>${country.subregion}</span>
                <span>${country.timezones}</span>
                <span>${country.topLevelDomain}</span>
                <span>${country.translations}</span>
            </div>
        `;

        container.appendChild(template);
    }


    init() {
        // RWD
        this.generateAlphabetDependedOnResolution(this.desktopViewport.matches);
        // RWD
        // this.generateLetters()
        this.getAllCountries();
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const country = new Country();
    country.init();
    country.hamburger.addEventListener('click', country.toggleHamburgerAndNavigation);
    country.showAllCountries.addEventListener('click', country.loadCountries);
    country.letters.addEventListener('click', country.selectCountryByFirstLetter);
    country.showCountry.addEventListener('click', country.getCountryByItsName);
    country.searchCountry.addEventListener('keypress', (e) => {
        if(e.keyCode === 13) {
            country.getCountryByItsName();
        }
    })
    country.container.addEventListener('click', (e) => country.showDetailedInfoAboutCountry(e));
    country.container.addEventListener('click', (e) => country.closeDetailedInfoAboutCountry(e));

    // RWD
    country.desktopViewport.addListener(isDesktop => {
        country.generateAlphabetDependedOnResolution(isDesktop.matches)
    })
    // RWD
});