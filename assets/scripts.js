function beachbaby_onload_14389798() {

    
// BODY EVENTS


    


    
    

// CLOSE NOTIFICATION

    $('.notification__close').click(function () {

        $('.notification').hide();

        return true;
    });


// BURGER MENU
    const burgerMenu = document.querySelector('.navigation');
    const navMenuButton = document.querySelector('.navigation__menu-button');
    const navCloseButton = document.querySelector('.navigation__close-button');
    
    
    function openNavMenu() {

        lockBodyScroll();
        navMenuButton.setAttribute('aria-expanded', 'true');
        burgerMenu.classList.add('navigation__menu--open');
        setTimeout(() => {navCloseButton.focus()}, 50);
    }

    function closeNavMenu() {

        unlockBodyScroll();
        navMenuButton.setAttribute('aria-expanded', 'false');
        burgerMenu.classList.remove('navigation__menu--open');
        navMenuButton.focus();
    }

    //Events
    if (burgerMenu) {
        burgerMenu.addEventListener('touchstart', init_touch_gesture);
        burgerMenu.addEventListener('touchend', end_touch_gesture);
    }

    if (navMenuButton) {
        navMenuButton.addEventListener('click', () => {
            openNavMenu();

        });

        navCloseButton.addEventListener('click', () => {
            closeNavMenu();
        });
    }



// SHOPPING CART

    const shoppingCartForm = document.querySelector('.cart');
    const addToCartForm = document.querySelector('#AddToCartForm');
    const shoppingCart = document.querySelector('.shopping-cart') ? document.querySelector('.shopping-cart') : document.querySelector('.shopping-cart--static');
    const shoppingCartButton = document.querySelector('.header__cart');
    const shoppingCartCloseButton = document.querySelector('.cart__button--back');
    const addToCartButton = document.getElementById('AddToCart');
    const clearCartButton = document.querySelector('.cart__button--clear');
    const ShoppingCartSubmit = document.querySelector('.cart__proceed-button');  // submit button will be created and assigned later

    let removeItemButtonArray = new Array();
    let itemCountInputArray = new Array();
    let lastButton = null;
    
    // Events
    if (shoppingCart) {

        if(shoppingCartForm) {

            document.addEventListener('click',(e) => {
                if (!e.target.closest) return;
                lastButton = e.target.closest('button, input[type=submit]');
            }, true);

            shoppingCartForm.addEventListener('submit', (event) => {  // preventing the regular buttons from submitting as default.
                //polyfill for safari
                if (!event.submitter) {
                    event.submitter = lastButton;
                }
                //end of polyfill
                
                if (event.submitter !== ShoppingCartSubmit) {
                    event.preventDefault();
                }

                console.log('event.submitter: ');
                console.log(event.submitter);
                console.log('Shopping Cart submit: ');
                console.log(ShoppingCartSubmit);

                return true;
            });
        }

        if(addToCartForm) {
            addToCartForm.addEventListener('submit', (event) => {  // preventing the regular buttons from submitting as default.
                event.preventDefault();
                return;
            });
        }


        getCartInventory();

        if (shoppingCartButton) {
            shoppingCartButton.addEventListener('click', () => {
                openCart();
            });
        }

        if(shoppingCartCloseButton) {
            shoppingCartCloseButton.addEventListener('click', (event) => {
                closeCart();
            });
        }

        if (addToCartButton) {
            addToCartButton.addEventListener('click', () => {
                addItemToCart();
            });
        }

        if (clearCartButton) {
            clearCartButton.addEventListener('click', () => {
                clearCartInventory();
                getCartInventory();
            });
        }

        if (shoppingCart.classList.contains('shopping-cart')) {
            shoppingCart.addEventListener('touchstart', init_touch_gesture);
            shoppingCart.addEventListener('touchend', end_touch_gesture);
        }
    }

    function openCart() {

        lockBodyScroll();
        shoppingCartButton.setAttribute('aria-expanded', 'true');
        shoppingCart.classList.add('shopping-cart--open');
        setTimeout(() => {shoppingCartCloseButton.focus()}, 50);
    }

    function closeCart() {

        unlockBodyScroll();
        shoppingCartButton.setAttribute('aria-expanded', 'false');
        shoppingCart.classList.remove('shopping-cart--open');
        shoppingCartButton.focus();
    }

    function addItemToCart() {
        let selectedItem;

        if (document.querySelector('.product__size--active') != null) {
            if (document.querySelector('.product__size--active').value == 0) {
                displaySizeError();
                return;
            }
            
            for (let i = 0; i < productPageSizeBoxArray.length; i++) {
                productPageSizeBoxArray[i].style.outline = "none";
            }
            selectedItem = document.querySelector('.product__size--active').value;
        }
        else if (document.querySelector('.product__pattern--active') != null) {
            if (document.querySelector('.product__pattern--active').dataset.available == '0') {
                errorShoppingCart('Out of stock.');
                return;
            }
            selectedItem = document.querySelector('.product__pattern--active').dataset.productId;
        }
        else {
            selectedItem = document.querySelector('.product__details').dataset.productId;
        }   

        displayButtonAnimation(addToCartButton);
        
        const data = { id: selectedItem, quantity: 1 };
        
        fetch('/cart/add.js', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            else {
                throw new Error('Invalid operation');
            }
        })
        .then(data => {
            endButtonAnimation(addToCartButton, 1);
            getCartInventory();
        })
        .catch((error) => {
            //console.error(error);
            endButtonAnimation(addToCartButton, 0);
        });
    }

    function updateCartInventory(lineIndex, quantity) {
        const data = { line: lineIndex, quantity: quantity };
        
        fetch('/cart/change.js', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
        })
        .then(response => {response.json()})
        .then(data => {
            getCartInventory();
        })
        .catch(() => {
            errorShoppingCart("Unable to connect to server. <br>Please try again later.");
        });
    }

    function clearCartInventory() {
        fetch('/cart/clear.js', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            }
            })
            .then(response => {response.json()})
            .then(data => {
                getCartInventory();
            })
            .catch(() => {
                errorShoppingCart("Unable toconnect to server. <br>Please try again later.");
            });
    }

    function updateShoppingCart(data) {
        const shoppingCartDiv = document.querySelector('.shopping-cart') ? document.querySelector('.shopping-cart') : document.querySelector('.shopping-cart--static');
        updateCartItemCount(data.item_count);
        clearShoppingCartDisplay();
        
        if (data.items.length == 0) {
            const itemBox = document.createElement('div');
            itemBox.classList.add('cart__item-box');
            shoppingCartDiv.insertBefore(itemBox, ShoppingCartSubmit.parentElement);
            itemBox.innerHTML = "Your cart is empty";
            return;
        }
        
        data.items.forEach((item, index) => {
            
            const itemBox = document.createElement('div');
            itemBox.classList.add('cart__item-box');
            shoppingCartDiv.insertBefore(itemBox, ShoppingCartSubmit.parentElement);

            const closeButton = document.createElement('button');
            closeButton.id = 'remove-' + item.id;
            closeButton.classList.add('cart__remove-item');
            closeButton.innerHTML = '&times;';
            closeButton.setAttribute('data-index', (index + 1));
            itemBox.appendChild(closeButton);

            const imageWrapper = document.createElement('div');
            const image = document.createElement('img');
            imageWrapper.classList.add('cart__image-wrapper');
            image.src = item.image;
            imageWrapper.appendChild(image);
            itemBox.appendChild(imageWrapper);

            const detailsWrapper = document.createElement('div');
            detailsWrapper.classList.add('cart__details-wrapper');
            itemBox.appendChild(detailsWrapper);
            const heading = document.createElement('h3');
            heading.classList.add('cart__product-title');
            heading.innerHTML = item.product_title;
            detailsWrapper.appendChild(heading);
            
            if (item.options_with_values) {  // means there must be pattern and/or size
                const pattern = document.createElement('p');
                pattern.classList.add('cart__product-pattern');

                let patternName = '';
                let sizeValue = '';

                item.options_with_values.forEach((option, index) => {
                    if (option.name.toLowerCase() == 'pattern') {
                        patternName = option.value.replace(/-/g, ' ');
                        patternName = patternName.replace(/_/g, ' ');
                    }
                    else if (option.name == 'Size') {
                        sizeValue = option.value.toUpperCase();
                    }
                });
                pattern.innerHTML = patternName;
                detailsWrapper.appendChild(pattern);
                if (sizeValue != '') {
                    const size = document.createElement('p');
                    size.classList.add('cart__product-size');
                    size.innerHTML = 'Size: ';
                    const sizeStrong = document.createElement('strong');
                    sizeStrong.innerHTML = sizeValue;
                    size.appendChild(sizeStrong);
                    detailsWrapper.appendChild(size);
                }
            }

            const priceQuantityWrapper = document.createElement('div');
            priceQuantityWrapper.classList.add('cart__price-quantity-wrapper');
            detailsWrapper.appendChild(priceQuantityWrapper);
            
            const price = document.createElement('p');
            price.classList.add('cart__product-price');
            price.innerHTML = '$ ' + (item.original_price / 100);
            priceQuantityWrapper.appendChild(price);

            const quantityDiv = document.createElement('div');
            quantityDiv.classList.add('cart__product-quantity');
            priceQuantityWrapper.appendChild(quantityDiv);

            const quantityLabel = document.createElement('label');
            quantityLabel.htmlFor = 'product-' + item.id;
            quantityLabel.classList.add('quantity__text');
            quantityLabel.innerHTML = 'Qty:';
            quantityDiv.appendChild(quantityLabel);

            const quantityInput = document.createElement('input');
            quantityInput.id = 'product-' + item.id;
            quantityInput.type = 'text';
            quantityInput.classList.add('quantity__input');
            quantityInput.setAttribute('data-index', (index + 1));
            quantityInput.value = item.quantity;
            quantityDiv.appendChild(quantityInput);
        });
        
        const subtotalDiv = document.createElement('div');
        subtotalDiv.classList.add('cart__subtotal');
        shoppingCartDiv.appendChild(subtotalDiv);
        shoppingCartDiv.insertBefore(subtotalDiv, ShoppingCartSubmit.parentElement);

        const subtotalText = document.createElement('span');
        subtotalText.classList.add('subtotal__text');
        subtotalText.innerHTML = 'Subtotal';
        subtotalDiv.appendChild(subtotalText);

        const subtotalPrice = document.createElement('span');
        subtotalPrice.classList.add('subtotal__price');
        subtotalPrice.innerHTML = '$ ' + (data.total_price / 100);
        subtotalDiv.appendChild(subtotalPrice);

        updateButtonEventListeners();
        updateCountInputs();
    }

    function updateButtonEventListeners() {

        if (removeItemButtonArray.length > 0) {
            removeItemButtonArray.forEach(button => {
                button.removeEventListener('click', (button) => {
                    updateCartInventory(button.dataset.index, 0);
                });
            });

            for (let i= 0; i < removeItemButtonArray.length; i++) {
                removeItemButtonArray.shift();
            }
        }
        removeItemButtonArray = Array.from(shoppingCart.getElementsByClassName('cart__remove-item'));
        if (removeItemButtonArray.length > 0) {
            
            removeItemButtonArray.forEach(button => {
                
                button.addEventListener('click', () => {
                    updateCartInventory(button.dataset.index, 0);
                });
            });
        }
    }

    function updateCountInputs() {
        if (itemCountInputArray.length > 0) {
            itemCountInputArray.forEach(input => {
                input.removeEventListener('change', () => {
                    updateCartInventory(input.dataset.index, input.value);
                });
            });

            for (let i= 0; i < itemCountInputArray.length; i++) {
                itemCountInputArray.shift();
            }
        }
        itemCountInputArray = Array.from(shoppingCart.getElementsByClassName('quantity__input'));
        if (itemCountInputArray.length > 0) {
            
            itemCountInputArray.forEach(input => {
                input.addEventListener('change', () => {
                    updateCartInventory(input.dataset.index, input.value);
                });
            });
        }
    }

    function clearShoppingCartDisplay() {
        const itemBoxArray = Array.from(shoppingCart.getElementsByClassName('cart__item-box'));
        const subTotalBox = shoppingCart.getElementsByClassName('cart__subtotal')[0];
        // const proceedButton = shoppingCart.getElementsByClassName('cart__proceed-button-wrapper')[0];

        if (itemBoxArray.length > 0) {
            itemBoxArray.forEach(itemBox => itemBox.parentElement.removeChild(itemBox));
        }

        if (subTotalBox != null) {
            subTotalBox.parentElement.removeChild(subTotalBox);
        }

        // if (proceedButton != null) {
        //     proceedButton.parentElement.removeChild(proceedButton);
        // }
    }

    function updateCartItemCount(itemCount) {
        if (document.querySelector('.header__cart-count')) {
            if (itemCount > 0) {
                document.querySelector('.header__cart-count').classList.add('header__cart-count--active');
                document.querySelector('.header__cart-count').innerHTML = itemCount;
            }
            else {
                document.querySelector('.header__cart-count').classList.remove('header__cart-count--active');
                document.querySelector('.header__cart-count').innerHTML = 0;
            }
        }
    }

    function errorShoppingCart(message){
        const errorBox = document.getElementById('errorMessageBox');
        errorBox.innerHTML = message;
        errorBox.classList.add('error-message-box--active');

        setTimeout(() => {
            errorBox.classList.remove('error-message-box--active');
        }, 2000);
    }

    function displaySizeError() {
        for (let i = 0; i < productPageSizeBoxArray.length; i++) {
            productPageSizeBoxArray[i].style.outline = "2px solid red";
        }
        document.querySelector('.product__size-box-container--active').focus();
        errorShoppingCart('Please select a size.');
    }

    function getCartInventory() {
        let myData = null;
        
        const data = fetch('/cart.js',
        {
            method: 'GET', 
            headers: {
                'Content-Type': 'application/json'
            }
        })
      .then(data => data.json())
      .then(updateShoppingCart)
      .catch(errorShoppingCart);
        
      return myData;
    }

    let lockBuyButton = false;

    function displayButtonAnimation(button) {
        if (lockBuyButton == true) {
            return;
        }
        lockBuyButton = true;
        
        const wrapper = button.parentElement.getElementsByClassName('shop__arrow-round-wrapper')[0];
        
        if (wrapper == null) {
            return;
        }

        const animatedDiv = wrapper.getElementsByClassName('shop__arrow-round')[0]; //.getElementById('AnimationDiv');
        
        if (animatedDiv == null) {
            return;
        }
        wrapper.classList.add('shop__arrow-round-wrapper--active');
        animatedDiv.classList.add('animation--display');
        animatedDiv.style.animationPlayState = 'running';
    }

    function endButtonAnimation(button, isSuccess) {
        const wrapper = button.parentElement.getElementsByClassName('shop__arrow-round-wrapper')[0];

        const animatedDiv = wrapper.getElementsByClassName('shop__arrow-round')[0]; 
        const successDiv = wrapper.getElementsByClassName('shop__success')[0];
        const errorDiv = wrapper.getElementsByClassName('shop__error')[0];

        animatedDiv.style.animationPlayState = 'paused';
        // wrapper.style.backgroundColor = 'transparent';
            
        animatedDiv.classList.remove('animation--display');
        if (isSuccess) {
            
            successDiv.classList.add('animation--display');
            document.querySelector('.shop__success-svg-path').style.animationPlayState = 'running';
            setTimeout(() => {
                successDiv.classList.remove('animation--display');
                wrapper.classList.remove('shop__arrow-round-wrapper--active');
            }, 1000);
        }
        else {
            errorDiv.classList.add('shop__error--display');
            errorShoppingCart('Unable to add the product');
            setTimeout(() => {
                errorDiv.classList.remove('shop__error--display');
                wrapper.classList.remove('shop__arrow-round-wrapper--active');
            }, 2000);
        }
            lockBuyButton = false;
        
    }


// CAROUSEL

    const carouselTrack = document.querySelector('.carousel__frame');
    const carouselSlides = carouselTrack ? Array.from(carouselTrack.children) : null;
    const carouselNextButton = document.querySelector('.carousel__button--right');
    const carouselPrevButton = document.querySelector('.carousel__button--left');
    const carouselNav = document.querySelector('.carousel__nav');
    const carouselIndicators = carouselNav ? Array.from(carouselNav.children) : null;
        
    let carousel_delay_duration = carouselTrack ? parseInt(carouselTrack.dataset.rotationDelay) * 1000 : 0; //converting to milliseconds
    let carousel_pause_duration = 10000; // milliseconds
    let carousel_last_click_time = new Date();

    

    if (carouselTrack) {
        if (carouselTrack.dataset.autorotate === 'true') {
            setInterval(autorotate_carousel, carousel_delay_duration);
        }

        //Carousel Events
        carouselPrevButton.addEventListener('click', function () {
            carousel_last_click_time = Date.now();
            moveCarouselSlideRight();
        });
        carouselNextButton.addEventListener('click', function () {
            carousel_last_click_time = Date.now();
            moveCarouselSlideLeft();
        });

        carouselNav.addEventListener('click', moveCarouselIndicator);

        carouselTrack.addEventListener('touchstart', init_touch_gesture);
        carouselTrack.addEventListener('touchend', end_touch_gesture);

        const carouselCTAHeaders = Array.from(carouselTrack.getElementsByClassName('carousel__cta-header'));
        const carouselCTAButtons = Array.from(carouselTrack.getElementsByClassName('button--carousel'));
        if (carouselCTAHeaders.length > 0) {
            carouselCTAHeaders.forEach(header => {
                header.addEventListener('animationend', (event) => {
                    if (event.target.classList.contains('carousel__cta-header--animation')) {
                        event.target.classList.remove('carousel__cta-header--animation');
                    }
                })
            });
        }

        if (carouselCTAButtons.length > 0) {
            carouselCTAButtons.forEach(button => {
                button.addEventListener('animationend', (event) => {
                    if (event.target.classList.contains('button--carousel--animation')) {
                        event.target.classList.remove('button--carousel--animation');
                    }
                });

                button.addEventListener('click', (event) => {
                    const sectionSelector = event.target.getAttribute('href');
                    document.querySelector(sectionSelector).scrollIntoView({ behavior: 'smooth' });
                });
            });

            
        }
    }

 //Autorotate function
    function autorotate_carousel() {
        if (carousel_last_click_time + carousel_pause_duration >= Date.now())
            return;
        moveCarouselSlideLeft();
    }

// Carousel Functions
    function move_slide(current_slide, target_slide) {
        current_slide.classList.remove('carousel__slide--active');
        target_slide.classList.add('carousel__slide--active');
    }

    function moveCarouselSlideLeft() {
        const current_slide = carouselTrack.querySelector('.carousel__slide--active');
        let next_slide = (current_slide.nextElementSibling);
        const current_indicator = carouselNav.querySelector('.carousel__nav-indicator--active');
        let next_indicator = current_indicator.nextElementSibling;

        if (next_slide == null) {
            next_slide = carouselSlides[0];
            next_indicator = carouselIndicators[0];
        }
        move_slide(current_slide, next_slide);
        update_carouselIndicators(current_indicator, next_indicator);
    }

    function moveCarouselSlideRight() {
        let current_slide = carouselTrack.querySelector('.carousel__slide--active');
        let prev_slide = (current_slide.previousElementSibling);
        const current_indicator = carouselNav.querySelector('.carousel__nav-indicator--active');
        let prev_indicator = current_indicator.previousElementSibling;

        if (prev_slide == null) {
            prev_slide = carouselSlides[carouselSlides.length - 1];
            prev_indicator = carouselIndicators[carouselIndicators.length - 1];

        }
        move_slide(current_slide, prev_slide);
        update_carouselIndicators(current_indicator, prev_indicator);
    }

    function moveCarouselIndicator(e) {
        const target_indicator = e.target.closest('button');

        if (target_indicator == null)
            return;

        const current_slide = carouselTrack.querySelector('.carousel__slide--active');
        const current_indicator = carouselNav.querySelector('.carousel__nav-indicator--active');
        const target_index = carouselIndicators.findIndex(indicator => indicator === target_indicator);
        const target_slide = carouselSlides[target_index];

        move_slide(current_slide, target_slide);
        update_carouselIndicators(current_indicator, target_indicator);

    }

    function update_carouselIndicators(current_indicator, target_indicator) {
        current_indicator.classList.remove('carousel__nav-indicator--active');
        target_indicator.classList.add('carousel__nav-indicator--active');
    }


//SMALL PICTURES
    const smallPicturesSection = document.querySelector('.small-pictures-section');

    if (smallPicturesSection != null) {
        const smallPictures = Array.from(smallPicturesSection.querySelectorAll('.small-pictures__link'));
        
        if (smallPictures.length != 0) {
            smallPictures.forEach(smallPicture => {
                smallPicture.addEventListener('click', function() {
                    const productSelector = smallPicture.getAttribute("href");
                    document.querySelector(productSelector).scrollIntoView({ behavior: 'smooth' });
                });
            });
        }
    }




//PRODUCT IMAGE SLIDER
    const productSliderFrame = document.getElementsByClassName('frontpage-collection__image-frame');
    const productSlideTrack = document.getElementsByClassName('frontpage-collection__image-slider');
    const productNextButton = document.getElementsByClassName('frontpage-collection__button--right');
    const productPrevButton = document.getElementsByClassName('frontpage-collection__button--left');
    
    let productPatternNav = null;
    const productSlides = new Array();
    const productPatterns = new Array();
    let isSliderActive = true;

    if (productSlideTrack.length != 0) {
        productPatternNav = document.getElementsByClassName('frontpage-collection__pattern-nav');

        if (productPatternNav.length == 0) {
            productPatternNav = document.getElementsByClassName('collection__pattern-nav');
        }

        for (let i = 0; i < productSlideTrack.length; i++) {
            productSlides.push(Array.from(productSlideTrack[i].getElementsByClassName('frontpage-collection__image-slide')));
        }
    
        for (let i = 0; i < productPatternNav.length; i++) {
            productPatterns.push(Array.from(productPatternNav[i].children));
        }

        //Product Image Slider Events
        for (let i = 0; i < productPrevButton.length; i++) {
            
            productPrevButton[i].addEventListener('click', () => {
                if (isSliderActive === false)
                    return;
                    
                moveProductSlideLeft(i);
            });
               
            productNextButton[i].addEventListener('click', () => {
                if (isSliderActive === false)
                    return;
                    
                moveProductSlideRight(i);
            });

            updateButtonStates(i);
        }
        
        for (let i = 0; i < productPatternNav.length; i++) {
            productPatternNav[i].addEventListener('click', (e) => {
                
                movePatternIndicator(e, i);
            });
        }

        for (let i = 0; i < productSliderFrame.length; i++) {
            productSliderFrame[i].addEventListener('touchstart', (e) => {
                init_touch_gesture(e);
            });
            productSliderFrame[i].addEventListener('touchend', (e) => {
                end_touch_gesture(e, i);
            });
        }
    }

    function moveProductSlide(currentSlide, targetSlide, index) {

        if (isSliderActive === false)
            return;

        const slideWidth = currentSlide.offsetWidth;
        
        currentSlide.classList.remove('frontpage-collection__slide-active');
        targetSlide.classList.add('frontpage-collection__slide-active');
        productSlideTrack[index].style.transform = "translateX(-" + targetSlide.dataset.index * slideWidth + "px)";
        
        isSliderActive = false;
        setTimeout(sliderDelay, 100);
        updatePatternIndicators(index);
        updateButtonStates(index);
    }

    function sliderDelay() {
        isSliderActive = true;
    }

    function moveProductSlideRight(index) {

        const currentSlide = productSlideTrack[index].querySelector('.frontpage-collection__slide-active');
        const nextSlide = (currentSlide.nextElementSibling);

        if (nextSlide == null){
            return;
        }
        
        moveProductSlide(currentSlide, nextSlide, index);
    }

    function moveProductSlideLeft(index) {
        
        const currentSlide = productSlideTrack[index].querySelector('.frontpage-collection__slide-active');
        const prevSlide = (currentSlide.previousElementSibling);

        if (prevSlide == null){
            return;
        }
        
        moveProductSlide(currentSlide, prevSlide, index);
    }

    function updateButtonStates(index) {
        const currentSlide = productSlideTrack[index].querySelector('.frontpage-collection__slide-active');
        
        if (productSlideTrack[index].getElementsByClassName('frontpage-collection__image-slide').length <= 1) {
            return;
        }
        
        const prevSlide = (currentSlide.previousElementSibling);
        const nextSlide = (currentSlide.nextElementSibling);
        
        if (prevSlide == null) {
            productPrevButton[index].disabled = true;
        }
        else if (productPrevButton[index].disabled == true) {
            productPrevButton[index].disabled = false;
        }

        if (nextSlide == null) {
            productNextButton[index].disabled = true;
        }
        else if (productNextButton[index].disabled == true) {
            productNextButton[index].disabled = false;
        }
    }

    function movePatternIndicator(e, index) {
        
        const targetPattern = e.target.closest('button');
         
        if (targetPattern == null){
            return;
        }
        
        let currentSlide = productSlideTrack[index].querySelector('.frontpage-collection__slide-active');
        let targetSlide = productSlides[index][targetPattern.dataset.index];

        moveProductSlide(currentSlide, targetSlide, index);
    }

    function updatePatternIndicators(index) {
        
        let currentPattern = productPatternNav[index].querySelector(".frontpage-collection__pattern-active");
        let targetPatternName = productSlideTrack[index].querySelector('.frontpage-collection__slide-active').dataset.pattern;
         
        if (currentPattern && currentPattern.dataset.name != targetPatternName) {
            let targetPatternIndex = productPatterns[index].findIndex(pattern => {
                if (pattern.dataset.name == targetPatternName) 
                    return true;
            });
            
            if (targetPatternIndex != -1) {
                targetPattern = productPatterns[index][targetPatternIndex];
                currentPattern.classList.remove('frontpage-collection__pattern-active');
                targetPattern.classList.add('frontpage-collection__pattern-active');
                targetPattern.focus();
            }
        }
    }

    function centerCurrentImage(slideFrame) {
        const slider = slideFrame.getElementsByClassName('frontpage-collection__image-slider')[0];
        const currentSlide = slideFrame.getElementsByClassName('frontpage-collection__slide-active')[0];
        const slideWidth = currentSlide.offsetWidth;
        
        slider.classList.add('frontpage-collection__image-slider--resizing');
        slider.style.transform = "translateX(-" + currentSlide.dataset.index * slideWidth + "px)";
        slider.classList.remove('frontpage-collection__image-slider--resizing');
    }
 
    
//SMALL IMAGES SECTION

    const smallImagesArray = Array.from(document.getElementsByClassName('small-pictures__frame'));
    
    if (smallImagesArray.length > 0) {
        smallImagesArray.forEach((element, index) => {
            let delayTime = 150 * (index + 1);
            setAnimationDelay(element, delayTime);
        });
    }
    


// PRODUCT PAGE SLIDERS
    const productMainImageFrame = document.querySelector('.product__main-images');
    const productPageMainImageArray = Array.from(document.getElementsByClassName('product__main-image-frame'));
    const productPageMainImages = new Array();
    const productPagePatternArray = Array.from(document.getElementsByClassName('product__pattern-indicator'));
    const productPageImageNavArray = Array.from(document.getElementsByClassName('product__indicator-nav'));
    const productPageIndicators = new Array();
    const productPageImageSliderArray = Array.from(document.getElementsByClassName('product__image-slider'));
    const productPageThumbnails = new Array();
    const productPageSizeArray = Array.from(document.getElementsByClassName('product__size'));
    const productPageSizeLabelArray = Array.from(document.getElementsByClassName('product__size-label'));
    const productPageSizeBoxArray = Array.from(document.getElementsByClassName('product__size-box-container'));

//Product page events      

    if (productPageImageNavArray.length != 0 && productPageImageSliderArray.length != 0) {

        productPageMainImageArray.forEach((imageArray, index) => {
            productPageMainImages.push(imageArray.getElementsByClassName('product__main-image-slide'));
        });
        
        productPageImageNavArray.forEach((navArray) => {
            productPageIndicators.push(navArray.getElementsByClassName('product__nav-indicator'));
        });

        productPageImageSliderArray.forEach((sliderArray) => {
            productPageThumbnails.push(sliderArray.getElementsByClassName('product__image-slide'));
        });

        for (let i = 0; i < productPageThumbnails.length; i++) {
            
            for(let j = 0; j < productPageThumbnails[i].length; j++) {
                
                productPageThumbnails[i][j].addEventListener('click', (e) => {
                    updateCurrentImage(productPageMainImages[i][j]);
                    updateProductSlide(e.target.parentElement);
                });
                productPageIndicators[i][j].addEventListener('click', () => {
                    updateCurrentImage(productPageMainImages[i][j]);
                });
            }
        }

        for (let i = 0; i < productPagePatternArray.length; i++) {
            productPagePatternArray[i].addEventListener('click', () => {
                updateProductPattern(i);
            });
        }

        // Size select box events
        if (productPageSizeArray.length != 0) {
            for (let i = 0; i < productPageSizeArray.length; i++) {
                productPageSizeArray[i].addEventListener('change', (e) => {
                    updateAllSelectedSizes(e, i);
                });
            }
        }

        if (productPageSizeBoxArray.length != 0) {
            for (let i = 0; i < productPageSizeBoxArray.length; i++) {
                const sizeBoxIndicators = Array.from(productPageSizeBoxArray[i].getElementsByClassName('product__size-box-indicator'));
                sizeBoxIndicators.forEach(indicator => {
                    indicator.addEventListener('click', () => {
                        const currentSizeSelectBox = document.querySelector('.product__size--active');
                        currentSizeSelectBox.value = indicator.dataset.id;
                        currentSizeSelectBox.dispatchEvent(new Event('change'));
                        updateAllSizeBoxStyles(indicator.dataset.index);
                    });
                });
            }
        }
        checkAvailability();
        updateCheckoutSelectBox();
        
        document.getElementById('checkout-hook').addEventListener('click', (event) => {
            event.preventDefault();
            const checkoutSelectBox = document.querySelector('.product-form__variants');
            
            if (document.querySelector('.product__pattern--active') && document.querySelector('.product__pattern--active').dataset.available == '0') {
                errorShoppingCart('Out of stock.');
            }
            else if (checkoutSelectBox.options[checkoutSelectBox.selectedIndex].value == 0) {
                displaySizeError();
            }
            return;
        });

        if (getComputedStyle(document.querySelector('.product__thumbnails-wrapper')).getPropertyValue('display') != "none") {
            const defaultAspectRatio = getDefaultAspectRatio(productPageMainImageArray);
        }

        if (productMainImageFrame != null) {
            productMainImageFrame.addEventListener('touchstart', init_touch_gesture);
            productMainImageFrame.addEventListener('touchend', end_touch_gesture);
        }
    }

    function updateCurrentImage(targetImage) {
        
        if (isSliderActive === false)
            return;

        const currentFrame = document.querySelector('.product__main-image-frame--active');
        const currentImage = currentFrame.getElementsByClassName('product__main-image-slide--active')[0];
        const imageIndex = targetImage.dataset.index;
        const frameWidth = document.querySelector('.product__main-images').offsetWidth;
        
        currentImage.classList.remove('product__main-image-slide--active');
        targetImage.classList.add('product__main-image-slide--active');
        currentFrame.style.transform = "translateX(-" + imageIndex * frameWidth + "px)";
        
        updateCurrentIndicator(imageIndex);

        isSliderActive = false;
        setTimeout(sliderDelay, 100);
    }

    function sliderDelay() {
        isSliderActive = true;
    }

    function moveProductImageLeft() {
        const currentFrame = document.querySelector('.product__main-image-frame--active');
        const currentImage = currentFrame.getElementsByClassName('product__main-image-slide--active')[0];
        if (currentImage.previousElementSibling != null) {
            updateCurrentImage(currentImage.previousElementSibling);
        }
    }

    function moveProductImageRight() {
        const currentFrame = document.querySelector('.product__main-image-frame--active');
        const currentImage = currentFrame.getElementsByClassName('product__main-image-slide--active')[0];
        if (currentImage.nextElementSibling != null) {
            updateCurrentImage(currentImage.nextElementSibling);
        }
    }

    function updateCurrentIndicator(index) {
        const currentIndicatorNav = document.querySelector('.product__indicator-nav--active');
        currentIndicatorNav.getElementsByClassName('product__indicator--active')[0].classList.remove('product__indicator--active');
        currentIndicatorNav.getElementsByClassName('product__nav-indicator')[index].classList.add('product__indicator--active');
    }
    
    function updateProductPattern(index) {
        
        const currentPatternNav = document.querySelector('.product__pattern--active');
        
        if (productPagePatternArray[index] == currentPatternNav) {
            return;
        }
        currentPatternNav.classList.remove('product__pattern--active');
        productPagePatternArray[index].classList.add('product__pattern--active');

        updateProductSlider(index);
        updateProductIndicatorNav(index)
        updateProductSize(index);
        updateSizeBox(index);
        updateProductMainImage(index);
        updateCheckoutSelectBox();
        checkAvailability();
        
        for (let i = 0; i < productPageSizeBoxArray.length; i++) {
            productPageSizeBoxArray[i].style.outline = "2px solid transparent";
        }
    }

    function updateProductMainImage(index) {
        
        document.querySelector('.product__main-image-frame--active').classList.remove('product__main-image-frame--active');
        productPageMainImageArray[index].classList.add('product__main-image-frame--active');
    }

    function updateProductSlider(index) {

        document.querySelector('.product__image-slider--active').classList.remove('product__image-slider--active');
        productPageImageSliderArray[index].classList.add('product__image-slider--active');
    }

    function updateProductSlide(targetSlide) {
        document.querySelector('.product__image-slider--active').querySelector('.product__image-slide--active').classList.remove('product__image-slide--active');
        targetSlide.classList.add('product__image-slide--active');
    }

    function updateProductIndicatorNav(index) {

        const currentProductIndicator = document.querySelector('.product__indicator-nav--active');
        
        if (currentProductIndicator == null) {
            return;
        }
        
        currentProductIndicator.classList.remove('product__indicator-nav--active');
        productPageImageNavArray[index].classList.add('product__indicator-nav--active');
    }
    
    function updateProductSize(index) {
        
        const currentSizeSelectBox = document.querySelector('.product__size--active');

        if (currentSizeSelectBox == null) {
            return;
        }

        currentSizeSelectBox.classList.remove('product__size--active');
        productPageSizeArray[index].classList.add('product__size--active');

        document.querySelector('.product__size-label--active').classList.remove('product__size-label--active');
        productPageSizeLabelArray[index].classList.add('product__size-label--active');
        
    }

    function updateSizeBox(index) {
        const currentSizeBox = document.querySelector('.product__size-box-container--active');

        if (currentSizeBox == null) {
            return;
        }
        currentSizeBox.classList.remove('product__size-box-container--active');
        productPageSizeBoxArray[index].classList.add('product__size-box-container--active');
        
        
    }

    function updateAllSelectedSizes(event, index) {

        for (let i = 0; i < productPageSizeArray.length; i++) {
            if (i == index ) {
                continue;
            }
            const selectedIndex = productPageSizeArray[index].selectedIndex;
            
            if (productPageSizeArray[i].options[selectedIndex].disabled != true) {
                productPageSizeArray[i].selectedIndex = selectedIndex;
            }
            else {
                productPageSizeArray[i].selectedIndex = 0;
            }
        }
        updateCheckoutSelectBox();
    }

    function updateAllSizeBoxStyles(index) {
        for (let i = 0; i < productPageSizeBoxArray.length; i++) {
            const oldSelectedIndicator = productPageSizeBoxArray[i].getElementsByClassName('product__size-box-indicator--active')[0];
            if (oldSelectedIndicator) {
                oldSelectedIndicator.classList.remove('product__size-box-indicator--active');
            }
            const newSelectedSize = productPageSizeBoxArray[i].getElementsByClassName('product__size-box-indicator')[index];
            if (newSelectedSize.disabled != true) {
                newSelectedSize.classList.add('product__size-box-indicator--active');
            }

            productPageSizeBoxArray[i].style.outline = "2px solid transparent";
        }
    }

    function updateCheckoutSelectBox() {
        // if none of the product variants is available
        if (document.querySelector('.product__details').dataset.available == "0") {
            return;
        }
        // also updating the select box used for the dynamic checkout button
        
        const checkoutSelectBox = document.querySelector('.product-form__variants');
        let newOptionValue = "";
        let newOptionText = "";

        if (productPageSizeArray.length != 0) {  // means product has size option
            const currentSizeSelectBox = document.querySelector('.product__size--active');

            newOptionValue = currentSizeSelectBox.options[currentSizeSelectBox.selectedIndex].value;
            newOptionText = currentSizeSelectBox.options[currentSizeSelectBox.selectedIndex].text;
        }
        else if (document.querySelector('.product__pattern--active') != null) { // means product doesn't have size but has pattern option
            const currentPattern = document.querySelector('.product__pattern--active');
            if (currentPattern.dataset.available == 1) {
                newOptionValue = currentPattern.dataset.productId;
            }
            else {
                newOptionValue = -1;
            }
            newOptionText = currentPattern.dataset.name;
        }
        else {
            newOptionValue = document.querySelector('.product__details').dataset.productId;
        }

        if (newOptionValue <= 0) {
            document.getElementById('checkout-hook').style.display = 'block';
        }
        else {
            document.getElementById('checkout-hook').style.display = 'none';
        }

        const newOption = document.createElement('option');
        newOption.value = newOptionValue;
        newOption.appendChild(document.createTextNode(`${newOptionText} - ${newOptionValue}`));

        checkoutSelectBox.removeChild(checkoutSelectBox.options[0]);
        checkoutSelectBox.appendChild(newOption);
    }

    function checkAvailability() {
        const currentPattern = document.querySelector('.product__pattern--active');
        const outOfStockDiv = document.querySelector('.product__out-of-stock');
        
        if (productPageSizeArray.length != 0 || outOfStockDiv == null || currentPattern == null) {
            return;
        }
                
        if (currentPattern.dataset.available == 0) {
            outOfStockDiv.style.display = 'block';
            document.getElementById('checkout-hook').style.display = 'block';
        }   
        else {
            outOfStockDiv.style.display = 'none';
            document.getElementById('checkout-hook').style.display = 'none';
        }
    }

    // Touch Event Functions
    let touchstart_originX = null;
    let touchstart_originY = null;

    function init_touch_gesture(event) {

        let touch_handle = event.changedTouches[0];

        touchstart_originX = parseInt(touch_handle.clientX);
        touchstart_originY = parseInt(touch_handle.clientY);
    }

    function end_touch_gesture(event, index) {

        let touch_handle = event.changedTouches[0];
        let endx = parseInt(touch_handle.clientX);
        let endy = parseInt(touch_handle.clientY);

        if (touchstart_originX == null) {
            console.log("Touch end without touch start");
            return;
        }
                
        //checking if the intended touch movement is vertical or horizontal. If vertical, we return;
        if (Math.abs(endx - touchstart_originX) < Math.abs(endy - touchstart_originY)) {
            
            if (event.currentTarget == burgerMenu) {
                event.preventDefault();
            }
            return;
        }
        
        if (endx > touchstart_originX) {

            switch (event.currentTarget) {
                
                case carouselTrack:
                    carousel_last_click_time = Date.now();
                    moveCarouselSlideRight();
                    break;
                case productSliderFrame[index]:
                    moveProductSlideLeft(index);
                    break;
                case productMainImageFrame:
                    moveProductImageLeft();
                    break;
                case burgerMenu:
                    closeNavMenu();
                    break;
                case shoppingCart:
                    closeCart();
                    break;
            }
        }
        else if (endx < touchstart_originX) {
            switch (event.currentTarget) {
                case carouselTrack:
                    carousel_last_click_time = Date.now();
                    moveCarouselSlideLeft();
                    break;
                case productSliderFrame[index]:
                    moveProductSlideRight(index);
                    break;
                case productMainImageFrame:
                    moveProductImageRight();
                    break;
            }
        }
        touchstart_originX = null;
        touchstart_originY = null;
    }

//SPECIAL KEY EVENTS

document.addEventListener('keydown', (event) => {
    let e = event || evt; // for trans-browser compatibility
    let charCode = e.which || e.keyCode;
    let focusableMenuItems;
    let targetElementIndex;

    switch(charCode) {
        case 13: //ENTER
            if (document.activeElement == navMenuButton) {
                e.preventDefault();
                openNavMenu();
            }
            else if (document.activeElement == shoppingCartButton) {
                e.preventDefault();
                openCart();
            }
            break;
        case 27: //ESC
            if (burgerMenu.classList.contains('navigation__menu--open')) {
                closeNavMenu();
            }
            else if (shoppingCart.classList.contains('shopping-cart--open')) {
                closeCart(); 
            }
            else if (fittingGuideWindow.classList.contains('fitting-guide--open')) {
               hideFittingGuide(); 
            }
            
            break;
        case 38: //UP ARROW
            if (burgerMenu.classList.contains('navigation__menu--open')) {
                focusableMenuItems = getKeyboardFocusableElements(burgerMenu);
            }
            else if (shoppingCart.classList.contains('shopping-cart--open')) {
                focusableMenuItems = getKeyboardFocusableElements(shoppingCart);
            }
            else {
                break;
            }
           
            targetElementIndex = focusableMenuItems.indexOf(document.activeElement) - 1;
            
            if (targetElementIndex < 0) {
                targetElementIndex = focusableMenuItems.length - 1;
            }

            focusableMenuItems[targetElementIndex].focus();
            break;
        case 40: //DOWN ARROW
            if (burgerMenu.classList.contains('navigation__menu--open')) {
                focusableMenuItems = getKeyboardFocusableElements(burgerMenu);
            }
            else if (shoppingCart.classList.contains('shopping-cart--open')) {
                focusableMenuItems = getKeyboardFocusableElements(shoppingCart);
            }
            else {
                break;
            }

            targetElementIndex = focusableMenuItems.indexOf(document.activeElement) + 1;

            if (targetElementIndex == focusableMenuItems.length) {
                targetElementIndex = 0;
            }
            focusableMenuItems[targetElementIndex].focus();
            
            break;
        case 9: //TAB
            if (burgerMenu.classList.contains('navigation__menu--open')) {
                focusableMenuItems = getKeyboardFocusableElements(burgerMenu);
            }
            else if (shoppingCart.classList.contains('shopping-cart--open')) {
                focusableMenuItems = getKeyboardFocusableElements(shoppingCart);
            }
            else {
                break;
            }
                
            if (e.shiftKey) {
                if (document.activeElement == focusableMenuItems[0]) {
                    e.preventDefault();
                    focusableMenuItems[focusableMenuItems.length - 1].focus();
                }
            }
            else {
                if (document.activeElement == focusableMenuItems[focusableMenuItems.length - 1]) {
                    e.preventDefault();
                    focusableMenuItems[0].focus();
                }
            }
            
            break;
    }
});

// ANIMATION LAZYLOADING

const animatedElementArray = Array.from(document.getElementsByClassName('animated'));

// Animation events
if (animatedElementArray.length > 0) {

    initializeAnimations(animatedElementArray);
    
    document.addEventListener('scroll', () => {
        runAnimation(animatedElementArray);
    });
}


// FITTING GUIDE
const fittingGuideWindow = document.querySelector('.fitting-guide__window-wrapper');
const fittingGuideButtonArray = Array.from(document.getElementsByClassName('fitting-guide__button'));
const fittingGuideCloseButton = document.querySelector('.fitting-guide__close-button');
let lastButtonFocused = null;

if (fittingGuideButtonArray.length != 0 && fittingGuideCloseButton !== null) {
    
    for (let i = 0; i < fittingGuideButtonArray.length; i++) {
        fittingGuideButtonArray[i].addEventListener('click', () => {
            showFittingGuide(i);
        });
   
        fittingGuideCloseButton.addEventListener('click', () => {
            hideFittingGuide();
        });
    }
}

function showFittingGuide(index) {
    
    fittingGuideWindow.classList.add('fitting-guide--open');
    fittingGuideCloseButton.focus();
    fittingGuideButtonArray[index].setAttribute('aria-collapsed', 'false');
    lastButtonFocused = fittingGuideButtonArray[index];
}

function hideFittingGuide(index) {
    fittingGuideWindow.classList.remove('fitting-guide--open');
    lastButtonFocused.focus();
    lastButtonFocused.setAttribute('aria-collapsed', 'true');
}



// UTILITIES

function lockBodyScroll() {
    document.body.classList.add("scroll-lock");
}

function unlockBodyScroll() {
    document.body.classList.remove("scroll-lock");
}

function getKeyboardFocusableElements (element = document) {
    return [...element.querySelectorAll(
      'a, button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])'
    )].filter(el => !el.hasAttribute('disabled'))
}
    
function setProportionalHeight(element, aspectRatio) {
    const elementWidth = element.offsetWidth;

    element.style.height = Math.floor((elementWidth / (aspectRatio * 100)) * 100).toString() + "px";
}  

function getDefaultAspectRatio(elementArray) {
    let defaultAspectRatio = 0;

    elementArray.forEach((imageFrame, index) => {
        const elementAspectRatio = parseFloat(imageFrame.dataset['aspectRatio']);
        
        if (index == 0) {
            defaultAspectRatio = elementAspectRatio;
        }
        else if (elementAspectRatio > defaultAspectRatio) {  //bigger aspect ratio means shorter image height compared to its width
            defaultAspectRatio = elementAspectRatio;
        }
    });
    return defaultAspectRatio;
}

function setHeight(height, element) {
    element.style.height = String(height) + 'px';
}

// COLLAPSIBLE

const collapsibleArray = Array.from(document.getElementsByClassName('button--collapsible'));

if (collapsibleArray.length != 0) {
    collapsibleArray.forEach((element) => {

        const container = element.nextElementSibling;

        if (container.classList.contains('active')) {
            container.style.height = container.clientHeight + 'px';
        }

        element.addEventListener('click', (event) =>{
            event.preventDefault();
            
            if (!element.classList.contains('button--collapsible--active')) {
                element.classList.add('button--collapsible--active');
                element.setAttribute('aria-expanded', 'true');
                container.classList.add('active');
                container.style.height = 'auto';
            
                
                const height = container.clientHeight + 'px';
                container.style.height = '0px';
                setTimeout(function () {
                    container.style.height = height;
                }, 10);
            } else {
                element.classList.remove('button--collapsible--active');
                element.setAttribute('aria-expanded', 'false');
                container.style.height = '0px';
            }

        });

        container.addEventListener('transitionend', function (event) {
            if(!container.previousElementSibling.classList.contains('button--collapsible--active')) {
                container.classList.remove('active');
            }
        }, {
            once: true
        });
    });
}
let onceFlag = false;

// Specific behaviour for recommendation collapsible
const recommendationContainer = document.querySelector('.recommendation-container');

if (recommendationContainer && recommendationContainer.getElementsByTagName('*').length <= 2) {
        
    if (recommendationContainer) {
        const config = { attributes: true, childList: true, subtree: true };
        const observer = new MutationObserver(updateElementHeight);
        observer.observe(recommendationContainer, config);
    }
}

function updateElementHeight(mutationList, observer) {
    if (!onceFlag) {
        recommendationContainer.style.height = 'auto';
        onceFlag = true;
    }
}


// ANIMATION FUNCTIONS

function initializeAnimations(animatedElementArray) { //runs only once on load
    animatedElementArray.forEach((element) => {
        const elementCoordinates = element.getBoundingClientRect();
        let isAnimationTriggered = true;

        if (elementCoordinates.top < 0 && elementCoordinates.bottom < 0) {
                isAnimationTriggered = false;
        }    
        else if (elementCoordinates.bottom > window.innerHeight && elementCoordinates.top > window.innerHeight) {
                isAnimationTriggered = false;
        }

        if (isAnimationTriggered) {
            if (element.classList.contains('small-pictures__frame')) {  //special case for small pictures section
                Array.from(document.getElementsByClassName('small-pictures__frame')).forEach((element) => {
                    element.style.animationPlayState = 'running'; 
                });
                
            }
            else {
                element.style.animationPlayState = 'running';
            }
        }

    });
}

function setAnimationDelay(element, delayTime = 500) {
    element.style.animationDelay = String(delayTime) + "ms";
}

function runAnimation(animatedElementArray) {

    animatedElementArray.forEach((element) => {
        if (isInViewport(element, 200)) {
            if (element.classList.contains('small-pictures__frame')) {  //special case for small pictures section
                Array.from(document.getElementsByClassName('small-pictures__frame')).forEach((element) => {
                    element.style.animationPlayState = 'running'; 
                });
                
            }
            else {
                element.style.animationPlayState = 'running';
            }
        }
    });
    
    return;
}

function isInViewport(element, offset = 0) {
    const elementCoordinates = element.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;

    return ((elementCoordinates.top <= (viewportCenter + offset) && elementCoordinates.top > 0) && elementCoordinates.bottom > 0)
            || ((elementCoordinates.bottom >= (viewportCenter - offset) && elementCoordinates.bottom < window.innerHeight) && elementCoordinates.top < 0)
}

document.body.addEventListener('click', function(event) {
    
    if (burgerMenu && burgerMenu.classList.contains('navigation__menu--open') && !event.target.closest('.navigation') && !event.target.closest('.navigation__menu-button')) {
        closeNavMenu();
    }
    if (shoppingCart && shoppingCart.classList.contains(('shopping-cart--open')) && !event.target.closest('.shopping-cart') && !event.target.closest('.header__cart')) {
        closeCart();
    }
});

}


window.onload = function () {

    beachbaby_onload_14389798();

    document.getElementsByTagName('body')[0].style.animationPlayState = 'running';
  
};
