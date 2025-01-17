document.addEventListener("alpine:init", () => {
  Alpine.data("pizzaCart", () => ({
    title: "Pizza Cart API",
    pizzas: [],
    filteredPizzas: [],
    selectedFilter: {
      small: { type: "", flavour: "" },
      medium: { type: "", flavour: "" },
      large: { type: "", flavour: "" },
    },
    isAdmin: false,
    initUsername: "MofokengTT21",
    username: "",
    usernameInput: "",
    cartId: "",
    signInBtn: "",
    showPopup: false,
    profile: false,
    cartPizzas: [],
    sumQty: 0.0,
    pizzaQty: {},
    resetTimeoutId: null,
    featuredPizzas: [],
    orderHistory: [],
    showHistory: false,
    paymentSuccessful: false,
    paymentAmount: "",
    message: "",
    messagePaid: "",

  
    showQty() {
      this.sumQty = this.cartPizzas.reduce(
        (accumulator, pizza) => accumulator + pizza.qty,
        0
      );
    },

    cartTotal: 0.0,

    createCart() {
      const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`;
      return axios.get(createCartURL).then((result) => {
        this.cartId = result.data.cart_code;
        localStorage.setItem("cartId", this.cartId);
      });
    },

    getCart() {
      const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`;
      return axios.get(getCartURL);
    },

    addPizza(pizzaId) {
      return axios
        .post("https://pizza-api.projectcodex.net/api/pizza-cart/add", {
          cart_code: this.cartId,
          pizza_id: pizzaId,
        })
        .then(() => {
          this.showCartData();
        });
    },

    removePizza(pizzaId) {
      return axios
        .post("https://pizza-api.projectcodex.net/api/pizza-cart/remove", {
          cart_code: this.cartId,
          pizza_id: pizzaId,
        })
        .then(() => {
          this.showCartData();
        });
    },

    pay(amount) {
      return axios.post(
        "https://pizza-api.projectcodex.net/api/pizza-cart/pay",
        {
          cart_code: this.cartId,
          amount,
        }
      );
    },

    showCartData() {
      this.getCart().then((result) => {
        const cartData = result.data;
        this.cartPizzas = cartData.pizzas.reduce((acc, pizza) => {
          const existingPizza = acc.find((p) => p.id === pizza.id);
          if (existingPizza) {
            existingPizza.qty += pizza.qty;
          } else {
            acc.push(pizza);
          }
          return acc;
        }, []);
        this.cartTotal = cartData.total.toFixed(2);
        this.showQty();
      });
    },

    init() {
      this.username = localStorage.getItem("username") || "";
      this.usernameInput = this.username;
      this.cartId = localStorage.getItem("cartId") || "";
      this.isAdmin = JSON.parse(localStorage.getItem("isAdmin")) || false;
      if (!this.usernameInput || !this.isAdmin) {
        this.defaultSetFeatured();
      }
      this.setFeaturedPizza();
      this.signIn();
      axios
        .get("https://pizza-api.projectcodex.net/api/pizzas")
        .then((result) => {
          this.pizzas = result.data.pizzas;
          this.filteredPizzas = this.pizzas;
        });

      if (this.cartId) {
        this.showCartData();
      } else if (this.username) {
        this.createCart().then(() => {
          this.showCartData();
        });
      }

      this.loadOrderHistory();
    },

    addPizzaToCart(pizzaId) {
      this.addPizza(pizzaId);
    },

    removePizzaFromCart(pizzaId) {
      this.removePizza(pizzaId);
    },

    payForCart() {
      this.pay(this.paymentAmount).then((result) => {
        if (result.data.status == "failure") {
          this.message = "Payment unsuccessful";
          setTimeout(() => (this.message = ""), 3000);
        } else {
          this.messagePaid = "Payment successful";
          this.paymentSuccessful = true;
          this.orderHistory.push({
            id: this.cartId,
            pizzas: [...this.cartPizzas],
            total: this.cartTotal
          });
          this.saveOrderHistory();
          setTimeout(() => {
            this.showOrderHistory();
        }, 3000);
        
 
          setTimeout(() => {
            this.message = "";
            this.cartPizzas = [];
            this.cartTotal = 0.0;
            this.cartId = "";
            this.createCart();
            this.paymentAmount = "";
            this.messagePaid = "";
          }, 3000);
        }
      });
    },

    incrementQty(pizzaId) {
      this.pizzaQty[pizzaId] = (this.pizzaQty[pizzaId] ?? 0) + 1;
    },

    decrementQty(pizzaId) {
      if (this.pizzaQty[pizzaId] > 0) {
        this.pizzaQty[pizzaId]--;
      }
    },

    updatePizzaQty() {
      this.cartPizzas.forEach((pizza) => {
        this.pizzaQty[pizza.id] = pizza.qty;
      });
    },

    orderPizzas(pizzaId) {
      if (!this.pizzaQty[pizzaId]) {
        this.incrementQty(pizzaId);
      }
      const qty = this.pizzaQty[pizzaId] || 1;
      if (this.resetTimeoutId) {
        clearTimeout(this.resetTimeoutId);
      }
      for (let i = 0; i < qty; i++) {
        setTimeout(() => {
          this.addPizza(pizzaId);
        }, 300 * i);
      }
      this.resetTimeoutId = setTimeout(() => {
        this.pizzaQty[pizzaId] = 0;
      }, 300 * qty);
    },

    filterPizzas(size = this.selectedFilter.size, criteria, value) {
      if (this.selectedFilter.size !== size) {
        this.selectedFilter[this.selectedFilter.size] = {
          type: "",
          flavour: "",
        };
        this.selectedFilter.size = size;
      }

      if (this.selectedFilter[size][criteria] === value) {
        this.selectedFilter[size][criteria] = "";
      } else {
        this.selectedFilter[size][criteria] = value;
      }

      this.filteredPizzas = this.pizzas.filter(
        (pizza) =>
          (!this.selectedFilter[size].type ||
            (pizza.size === size &&
              pizza.type === this.selectedFilter[size].type)) &&
          (!this.selectedFilter[size].flavour ||
            (pizza.size === size &&
              pizza.flavour === this.selectedFilter[size].flavour))
      );
    },

    isSelected(size, criteria, value) {
      return this.selectedFilter[size][criteria] === value;
    },

    resetFilter() {
      this.selectedFilter = {
        small: { type: "", flavour: "" },
        medium: { type: "", flavour: "" },
        large: { type: "", flavour: "" },
      };
      this.filteredPizzas = this.pizzas;
    },

    filterOptions: {
      type: ["meaty", "chicken", "veggie"],
      flavour: [
        "Margherita",
        "Garlic & Mushroom",
        "Chicken & Mushroom",
        "Regina",
        "Sweet Chilli Chicken",
        "3 Cheese",
        "Four Season",
        "Hawaiian",
        "Tikka Chicken",
      ],
    },

    setFeaturedPizza(pizzaId) {
      const username = this.username || this.initUsername;

      axios
        .post("https://pizza-api.projectcodex.net/api/pizzas/featured", {
          username: username,
          pizza_id: pizzaId,
        })
        .then(() => {
          this.getFeaturedPizzas();
        });
    },

    defaultSetFeatured() {
      this.setFeaturedPizza(13);
      this.setFeaturedPizza(5);
      this.setFeaturedPizza(15);
    },

    getFeaturedPizzas() {
      const username = this.username || this.initUsername;
      const url = `https://pizza-api.projectcodex.net/api/pizzas/featured?username=${username}`;

      axios.get(url).then((result) => {
        this.featuredPizzas = result.data.pizzas;
      });
    },

    pizzaImg(pizza) {
      return `images/pizza-${pizza.flavour
        .replace(/ /g, "-")
        .toLowerCase()}.jpeg`;
    },

    typeImg(type) {
      return `images/${type}.png`;
    },

    totalQty() {
      return this.cartPizzas.reduce((sum, pizza) => sum + pizza.qty, 0);
    },

    openPopup() {
      this.showPopup = true;
    },

    profileBtn() {
      this.profile = true;
    },

    closePopup() {
      this.showPopup = false;
      this.profile = false;
    },

    signIn() {
      if (!this.usernameInput) {
        this.signInBtn = "Sign In";
      } else {
        this.signInBtn = "Sign Out";
      }
      this.signOut();
    },

    signOut() {
      if (this.signInBtn === "Sign Out") {
        this.usernameInput = "";
      }
    },

    async submitUsername() {
      this.username = this.usernameInput;
      localStorage.setItem("username", this.username);
      localStorage.setItem("isAdmin", JSON.stringify(this.isAdmin));
      

      await this.createCart();
      await this.showCartData();

      localStorage.setItem("showPopup", "true");
      if (this.signInBtn === "Sign In" && this.usernameInput) {
        location.reload();
      } else {
        this.init();
      }
    },

    saveOrderHistory() {
      if (this.username) {
        if (this.orderHistory.length > 3) {
          this.orderHistory = this.orderHistory.slice(-3);
        }
        localStorage.setItem('orderHistory_' + this.username, JSON.stringify(this.orderHistory));
      }
    },

    loadOrderHistory() {
      const storedHistory = localStorage.getItem('orderHistory_' + this.username);
      if (storedHistory) {
        this.orderHistory = JSON.parse(storedHistory);
      }
    },

    showOrderHistory() {
      this.showHistory = true;
    }
  }));
});
