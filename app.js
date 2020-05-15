const openCartBtn = document.querySelector('.lnr-cart');
const closeCartBtn = document.querySelector('.close-cart');
const cartQty = document.querySelector('.cart-quantity');

const cartEl = document.querySelector('.cart');
const productsEl = document.querySelector('.shop__flex-container');

const clearCartBtn = document.querySelector('.cart--clear-btn');

const bgOverlay = document.querySelector('.bg-overlay');

const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart__content');

let cart = [];
let buttonsEl = [];

class Products {
  async getProducts() {
    try {
      let res = await fetch('products.json');
      let data = await res.json();
      let products = data.items;

      products = products.map(item => {
        const { name, detail, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { name, detail, price, id, image };
      });
      return products;
    } catch (err) {
      alert('error loading, please re-try');
    }
  }
}

class UI {
  displayProducts(products) {
    let result = '';
    products.forEach(product => {
      result += `<article class="item__container ">
        <div class="item ">
          <div class="item__details ">
            <div class="item__details--name ">${product.name}</div>
            <div class="item__details--price ">$${product.price}</div>
            <button class="item__details--buyBtn bagBtn" data-id=${product.id}>
              Add to cart
            </button>
          </div>
          <img
            src=${product.image}
            alt="Product Image"
            class="item__img "
          />
        </div>
      </article>`;
    });
    productsEl.innerHTML = result;
  }
  getCartBtns() {
    const buttons = [...document.querySelectorAll('.bagBtn')];
    buttonsEl = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = 'In cart';
        button.disabled = true;
      }
      button.addEventListener('click', e => {
        e.target.innerText = 'In cart';
        e.target.disabled = true;
        //get individual product
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        //add product to cart
        cart = [...cart, cartItem];
        //save cart to local storage
        Storage.saveCart(cart);
        //set cart values
        this.setCartValues(cart);
        //display cart item
        this.addCartItem(cartItem);
        //show cart
        this.openCart();
      });
    });
  }
  setCartValues(cart) {
    let priceTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      priceTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(priceTotal.toFixed(2));
    cartQty.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart__item');
    div.innerHTML = `
        <div class="cart__item--top-row">
          <img
            src=${item.image}
            alt="cart item"
            class="cart__item--img"
          />
          <h4 class="cart__item--name">${item.name} ${item.detail}</h4>
          <h5 class="cart__item--price">$${item.price}</h5>
          
        </div>
        <div class="cart__item--bottom-row">
        <span class="cart__item--remove" data-id=${item.id}>remove</span>
          <i class="cart__item--icon lnr lnr-chevron-up"data-id=${item.id}></i>
          <p class="cart__item--quantity">${item.amount}</p>
          <i class="cart__item--icon lnr lnr-chevron-down"data-id=${item.id}></i>
        </div>
     `;
    cartContent.appendChild(div);
  }
  openCart() {
    cartEl.classList.add('openCart');
    bgOverlay.classList.add('visible-overlay');
  }
  hideCart() {
    bgOverlay.classList.remove('visible-overlay');
    cartEl.classList.remove('openCart');
  }

  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    openCartBtn.addEventListener('click', this.openCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  }
  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }

  cartFunctionality() {
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    });
    cartContent.addEventListener('click', e => {
      if (e.target.classList.contains('cart__item--remove')) {
        let removeItem = e.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (e.target.classList.contains('lnr-chevron-up')) {
        let addAmount = e.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (e.target.classList.contains('lnr-chevron-down')) {
        let lowerAmount = e.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartQty = cart.map(item => item.id);
    cartQty.forEach(id => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `Add to cart`;
  }
  getSingleButton(id) {
    return buttonsEl.find(button => button.dataset.id === id);
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find(product => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  const products = new Products();

  ui.setupApp();

  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getCartBtns();
      ui.cartFunctionality();
    });
});
