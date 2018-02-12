$(document).ready(function(){  

    $(".products  .add_cart_button").click(function(){
        var product=getProductFromProducts($(this));
        
        addProductToCart(product);
        });  

    $(".product_details .add_cart_button").click(function(){
        var product=getProductFromProductDetails($(this));
        
        addProductToCart(product);
        }); 

    $(".register_form").submit(onRegisterFormSubmit);   
    $(".login_form").submit(onLoginFormSubmit);   

    $(document).on("change","#cart_dialog tbody .product_qty_input", function() {
        var qty=$(this).val();

        updateProductTotal($(this).closest(".product_row") , qty);  
        
        var product=getProductFromData($(this));
        
        product.qty=qty;

        var params=createProductParams(product);

        $.get("/cart/update",{params:params} ,function(result){
            if(!result.error)
                {
                  
                }
            });

        });

    $(document).on("click","#cart_dialog tbody .product_delete_button", function() {
        $(this).closest(".product_row").remove();

        updateCart();

        var product=getProductFromData($(this));

        var params=createProductParams(product);

        $.get("/cart/delete",{params:params} ,function(result){
            if(!result.error)
                {
                  
                }
            });
        });

    function onRegisterFormSubmit(event){
        var inputName=$(".register_form #input_name");
        var inputEmail=$(".register_form #input_email");
        var inputPassword=$(".register_form #input_password");

        $.post("/user/register",{name:inputName.val(), email:inputEmail.val(), password:inputPassword.val()} ,function(result){
            var error=result.error;

            if(!error)
                {
                window.location.replace(result.redirectUrl);  
                return;  
                }
            
            $(".register_form .form-group.invalid").removeClass("invalid");

            if(error.name)
                { 
                setErrorMsg(inputName.closest(".form-group"), error.name);  
                }
            
            if(error.email)
                { 
                setErrorMsg(inputEmail.closest(".form-group"), error.email);  
                }    
            
            if(error.password)
                { 
                setErrorMsg(inputPassword.closest(".form-group"), error.password);  
                }
            });

        event.preventDefault();
        }
        
    function onLoginFormSubmit(event){
        var inputEmail=$(".login_form #input_email");
        var inputPassword=$(".login_form #input_password");

        $.post("/user/login",{email:inputEmail.val(), password:inputPassword.val()} ,function(result){
            var error=result.error;

            if(!error)
                {
                window.location.replace(result.redirectUrl);  
                return;  
                }
            
            $(".login_form .form-group.invalid").removeClass("invalid");
            
            if(error.email)
                { 
                setErrorMsg(inputEmail.closest(".form-group"), error.email);  
                }    
            
            if(error.password)
                { 
                setErrorMsg(inputPassword.closest(".form-group"), error.password);  
                }
            
            if(error.login)
                { 
                setErrorMsg($(".login_form .form-group.login_error"), error.login);  
                }
            });

        event.preventDefault();
        }
     
    function setErrorMsg(formGroup, msg){
        formGroup.addClass("invalid");
        formGroup.find(".error .msg").text(msg);
        } 
        
    function getProductFromData(element){
        return JSON.parse(element.attr("data-product"));
        } 
        
    function getProductId(element){
        return element.attr("data-id");
        } 
    
    function getProductFromProducts(element){
        var id=getProductId(element);

        var product={ id:id };

        return product;
        } 
    
    function getProductFromProductDetails(element){
        var id=getProductId(element);

        var productDetails=element.closest(".product_details");

        var size=productDetails.find(".product_size .active").attr("data-size");
        var color=productDetails.find(".product_color .active").attr("data-color");

        var product={
            id:id,
            options:{
                size:size,
                color:color
                }
            };

        return product;
        } 
    
    function createProductParams(product){
        return JSON.stringify( {product:product} );
        } 

    function addProductToCart(product){
        var params=createProductParams(product);

        $.post("/cart/add",{params:params} ,function(result){
            if(!result.error)
                {
                setCart(result.cart);    
                }
            });
        } 
       
    function updateProductTotal(productRow, qty){
        var productPrice=productRow.find(".product_price");

        var price=parseInt( productPrice.text() );

        productRow.find(".product_total_price").text(price * qty);

        updateCart();
        } 
    
    function updateCart(){
        var cartQty=0;
        var checkoutTotalPrice=0;

        var productQty,productTotalPrice;
        $(".product_row").each(function(){
            productQty=$(this).find(".product_qty_input");
            productTotalPrice=$(this).find(".product_total_price");

            cartQty+=parseInt( productQty.val() );
            checkoutTotalPrice+=parseInt( productTotalPrice.text() );
            });
        
        $(".checkout_total_price .price").text(checkoutTotalPrice);

        $(".cart_qty_text").text(cartQty);
        }
    
    function setCart(cart){
        var cartTbody=$("#cart_dialog tbody");

        cartTbody.find(".product_row").remove();

        var cartQty=0;
        var checkoutTotalPrice=0;
        var rows=[];

        for(var i = 0; i < cart.length; i++) 
            {  
            cartQty+=cart[i].qty;
            checkoutTotalPrice+=cart[i].price * cart[i].qty;
            rows.push( createProductRow(cart[i]) );    
            }
        
        cartTbody.append(rows);
        
        $(".checkout_total_price .price").text(checkoutTotalPrice);

        $(".cart_qty_text").text(cartQty);
        }
    
    function createProductRow(product){
        var productRow=$("<tr>").addClass("product_row");

        var tdProduct=$("<td>", {"data-th":"Product"}).appendTo(productRow);
        var cartProduct=$("<div>").addClass("cart_product").appendTo(tdProduct);

        var options=product.options;
        var dataProduct=JSON.stringify({id:product.id, options: options});

        $("<span>").addClass("product_name")
            .text(product.name)
            .appendTo(cartProduct);
            
        cartProduct.append(createProductOptions(options));

        $("<td>", {"data-th":"Price"})
            .addClass("product_price price cart_text_center")
            .text(product.price) 
            .appendTo(productRow);

        var tdQuantity=$("<td>", {"data-th":"Quantity"})
            .appendTo(productRow);
        
        $("<input>", {type:"number",  min:"1", value:product.qty, "data-product":dataProduct})
            .addClass("product_qty_input form-control cart_text_center") 
            .appendTo(tdQuantity);  

        $("<td>", {"data-th":"Total"})
            .addClass("product_total_price price cart_text_center")
            .text(product.price * product.qty) 
            .appendTo(productRow);    

        var tdActions=$("<td>", {"data-th":""})
            .addClass("actions")
            .appendTo(productRow);
        
        var div= $("<div>").addClass("horizontal_center").appendTo(tdActions);    

        $("<button>", {"data-product":dataProduct})
            .addClass("product_delete_button btn btn-danger btn-sm")
            .append($("<i>").addClass("fa fa-trash-o"))
            .appendTo(div);
        
        return productRow;
        } 

    function createProductOptions(options){
        var productOptions=$("<div>").addClass("product_options");
        var spanOption;

        for (var optionName in options) 
            {
            spanOption=$("<span>").addClass("option").appendTo(productOptions);

            $("<span>").addClass("option_name").text(optionName+":").appendTo(spanOption);
            $("<span>").text(options[optionName]).appendTo(spanOption);
            }

        return productOptions;    
        }     
    }); 
