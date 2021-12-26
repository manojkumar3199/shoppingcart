const client = contentful.createClient({
  space: "h2c2etf2qhgr",
  accessToken: "7zkfPfVLlbEa6_-McLaMyp_22dGMuSD42bqcwmFE28s",
});

const cartBtn = document.querySelector(".cart-btn");
const productsContainer = document.querySelector(".products-container");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItemsContainer = document.querySelector(".cart-items");
const closeCartbtn = document.querySelector(".fa-window-close");
const itemCount = document.querySelector(".item-count");
const cartTotal = document.querySelector(".cart-total");
const clearCartBtn = document.querySelector(".clear-cart-btn");

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    const products = [...JSON.parse(localStorage.getItem("products"))];
    return products.find((product) => product.id === id);
  }
  static saveCartItems() {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }
  static getCartItems() {
    const cartItems = JSON.parse(localStorage.getItem("cartItems"));
    return cartItems;
  }
}

let cartItems = Storage.getCartItems() ? Storage.getCartItems() : [];

class Products {
  async getProducts() {
    const contentful = await client.getEntries();
    const refienedContentful = [...contentful.items].map((item) => {
      const { price, title } = item.fields;
      const { url } = item.fields.url.fields.file;
      const { id } = item.sys;
      return { id, price, title, url };
    });
    console.log(refienedContentful);
    return refienedContentful;
  }
}

class UI {
  displayProducts(products) {
    let result = ``;
    [...products].forEach((product) => {
      result += `
          <!-- single product start -->
          <article class="product">
            <div class="img-container">
              <img src="${product.url}" alt="product" class="product-img"/>
              <div class="add-btn" id="${product.id}">
                <i class="fa fa-shopping-cart"></i>
                add to bag
              </div>
            </div>
            <h3>${product.title}</h3>
            <h4>Rs.${product.price}</h4>
          </article>
          <!-- single product end -->
      `;
    });
    productsContainer.innerHTML = result;
  }

  displayCartValue() {
    itemCount.textContent = cartItems.length;
    let total = 0;
    cartItems.forEach((product) => {
      total += product.amount * product.price;
    });
    this.populateCart(cartItems);
    this.getCartBtns();
    cartTotal.textContent = total;
  }

  checkProductInCart(id) {
    return cartItems.find((product) => product.id === id);
  }

  displayCartItem(product) {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
    <img class="cart-item-img" src="${product.url}"/>
    <div class="product-info">
      <h4>${product.title}</h4>
      <h5>rs.${product.price}</h5>
      <span class="remove-item" id="${product.id}">remove</span>
    </div>
    <div class="amount-btn">
      <i class="fa fa-arrow-up" id="${product.id}"></i>
      <p class="item-amount" id="${product.id}">${product.amount}</p>
      <i class="fa fa-arrow-down" id="${product.id}"></i>
    </div>
    `;
    cartItemsContainer.appendChild(div);
    console.log(div.innerHTML);
  }

  populateCart(products) {
    let result = ``;
    [...products].forEach((product) => {
      result += `
      <div class = "cart-item">
        <img class="cart-item-img" src="${product.url}"/>
        <div class="product-info">
          <h4>${product.title}</h4>
          <h5>rs.${product.price}</h5>
          <span class="remove-item" id="${product.id}">remove</span>
        </div>
        <div class="amount-btn">
          <i class="fa fa-arrow-up" id="${product.id}"></i>
          <p class="item-amount" id="${product.id}">${product.amount}</p>
          <i class="fa fa-arrow-down" id="${product.id}"></i>
        </div>
      </div>
      `;
    });
    cartItemsContainer.innerHTML = result;
    console.log(cartItemsContainer.innerHTML);
  }

  getAddBtns() {
    const addBtns = [...document.getElementsByClassName("add-btn")];
    addBtns.forEach((addBtn) => {
      // check added product in cartItems array
      const inCart = this.checkProductInCart(parseInt(addBtn.id));
      if (inCart) {
        addBtn.childNodes[2].nodeValue = " in cart ";
      }
      addBtn.addEventListener("click", (event) => {
        // check selected product in cartItems array
        const checkInCart = this.checkProductInCart(event.currentTarget.id);
        if (!checkInCart) {
          // get selected product form local storage api
          let product = Storage.getProduct(event.currentTarget.id);
          // add amount property to selected product
          product = { ...product, amount: 1 };
          // add selected product in cartItems array
          cartItems = [...cartItems, product];
          // save cartItems into local storage api
          Storage.saveCartItems();
          //update itemCount and cartTotal
          itemCount.textContent = cartItems.length;
          let total = 0;
          cartItems.forEach((product) => {
            total += product.amount * product.price;
          });
          cartTotal.textContent = total;
          //change btn text
          event.currentTarget.childNodes[2].nodeValue = " in cart ";
          // display cartItems to cart
          this.displayCartItem(product);
          // add function in cartItems btns
          this.getCartBtns();
        }
      });
    });
  }

  removeItem(id) {
    cartItems = [...cartItems].filter((product) => product.id != id);
    Storage.saveCartItems(cartItems);
    const btn = document.getElementById(`${id}`);
    btn.childNodes[2].nodeValue = " add to bag ";
  }

  getCartBtns() {
    const cartProducts = [...document.getElementsByClassName("cart-item")];
    cartProducts.forEach((cartProduct) => {
      cartProduct.addEventListener("click", (event) => {
        if (event.target.classList.contains("remove-item")) {
          this.removeItem(event.target.id);
          this.displayCartValue();
        }
        if (event.target.classList.contains("fa-arrow-up")) {
          cartItems = [...cartItems].map((product) => {
            if (product.id === event.target.nextElementSibling.id)
              product.amount += 1;
            return product;
          });
          Storage.saveCartItems(cartItems);
          this.displayCartValue();
        }
        if (event.target.classList.contains("fa-arrow-down")) {
          const modifiyProduct = [...cartItems].find(
            (product) => product.id === event.target.previousElementSibling.id
          );
          modifiyProduct.amount -= 1;
          if (modifiyProduct.amount === 0) {
            this.removeItem(modifiyProduct.id);
            this.displayCartValue();
            return;
          }
          cartItems = [...cartItems].map((product) => {
            if (product.id === modifiyProduct.id) {
              product.amount = modifiyProduct.amount;
            }
            return product;
          });
          Storage.saveCartItems(cartItems);
          this.displayCartValue();
        }
      });
    });
  }

  clearCart() {
    clearCartBtn.addEventListener("click", () => {
      if (cartItems.length != 0) {
        [...cartItems].forEach((product) => {
          this.removeItem(product.id);
        });
        Storage.saveCartItems(cartItems);
        this.displayCartValue();
      } else {
        alert("your cart is already empty!");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  const ui = new UI();
  ui.displayCartValue();
  ui.clearCart();
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getAddBtns();
    });

  cartBtn.addEventListener("click", () => {
    cartOverlay.classList.add("show-cart-overlay");
  });
  closeCartbtn.addEventListener("click", () => {
    cartOverlay.classList.remove("show-cart-overlay");
  });
});
