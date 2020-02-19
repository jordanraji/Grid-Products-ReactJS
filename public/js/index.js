class Item extends React.Component {
    constructor(props) {
        super(props);

        this.priceHandler = this.priceHandler.bind(this);
    }
    render() {
        return (
            <div className="col-md-3 col-6 my-3">
                <div className="card card-body h-100">
                    <p className="text-center" style = {{ fontSize: this.props.product.size }}>{this.props.product.face}</p>
                    <h5 className="text-center text-purple">${ this.priceHandler(this.props.product.price) }</h5>
                    <p className="text-center text-secondary"><small>{ this.dateHandler(this.props.product.date) }</small></p>
                </div>
            </div>
        );
    }

    priceHandler(cents) {
        return (cents/100.0).toFixed(2);
    }

    dateHandler(date) {
        const product_date = new Date(date);
        const current_date = new Date();
        const difference_time = Math.abs(current_date - product_date);
        const difference_days = Math.ceil(difference_time / (1000 * 60 * 60 * 24)); 
        if (difference_days < 7){
            return difference_days +" days ago"
        }
        return date.substr(0, 15);
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            products: [],
            orderBy: "id",
            page: 0,
            prevY: 0,
            loading: false,
        };

        this.getProducts = this.getProducts.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    getProducts(page=0, limit=20, sort='id', addToProducts=false) {
        this.setState({loading: true});
        axios({
            url: 'http://localhost:3000/products',
            method: 'get',
            params: {
                "_page": page,
                "_limit": limit,
                "_sort": sort
            }
        }).then(response => {
            console.log(response);

            if(addToProducts){
                this.setState({
                    products: this.state.products.concat(response.data),
                });
            } else {
                this.setState({
                    products: response.data,
                });
            }
            this.setState({ loading: false });
        })
    }

    handleChange(){
        this.setState({ orderBy: event.target.value });
        this.getProducts(0, undefined, event.target.value, false);
    }

    handleObserver(entities, observer) {
        const y = entities[0].boundingClientRect.y;
        if (this.state.prevY > y) {
            this.setState({ page: this.state.page + 1 });
            this.getProducts(this.state.page + 1, undefined, this.state.orderBy , true);
        }
        this.setState({ prevY: y });
    }

    componentDidMount() {
        this.getProducts();

        var options = {
            root: null,
            rootMargin: "0px",
            threshold: 1.0
        };

        this.observer = new IntersectionObserver(
            this.handleObserver.bind(this),
            options
        );

        this.observer.observe(this.loadingRef);
    }

    render() {
        const loadingCSS = {
            height: "20px",
            margin: "20px"
        };
        return (
            <div>
                <nav className="navbar fixed-top navbar-light bg-white">
                    <div className="container">
                        <span className="navbar-brand">faces</span>
                        <form className="form-inline">
                            <label>
                                <span className="mr-2">Order by:</span> 
                                <select className="custom-select" onChange={this.handleChange}>
                                    <option value="id">ID</option>
                                    <option value="price">Price</option>
                                    <option value="size">Size</option>
                                </select>
                            </label>
                        </form>
                    </div>
                </nav>
                <div className="container">
                    <div className="row" style={{ minHeight: "800px" }}>
                        {this.state.products.map(function (product, index) {
                            return <Item key={index} product={product}></Item>
                        })}
                    </div>

                    {this.state.loading? 
                        <div className="text-center">
                            <div className="spinner-border">
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                        : ""}

                    <div ref={loadingRef => (this.loadingRef = loadingRef)} style={loadingCSS}>
                    </div>

                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <App />, document.getElementById('app')
);
