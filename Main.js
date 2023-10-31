let ThemeColors = {
    GreenColor: "#83eaf1",
    BlueColor: "#63a4ff",
    SecColor: "#F0F0F0",
    GreyOutline: "#f7f7f7"
};
let Font = "'Poppins', sans-serif";
let Shop = "robuilder";
let SortSections = ["Packs", "Assets", "Free"];
let SocialLinks = [{
    Site: "Twitter",
    Color: "#1DA1F2",
    Name: "RoBuilderYT",
    Link: "https://twitter.com/RoBuilderYT"
}, {
    Site: "YouTube",
    Color: "#FF0000",
    Name: "RoBuilder",
    Link: "https://www.youtube.com/@RoBuilder"
}, {
    Site: "Discord",
    Color: "#5865F2",
    Name: "RoBuilders",
    Link: "https://discord.gg/robuilders"
}];
let StatNames = ["Views", "Purchases", "Downloads", "Earnings"];
let FullAmount = 50;
let CurrentSort = "Packs";
let LastTimestamp = 0;
let ServerURL = "https://exotek.co/downloadshop/" + Shop + "/";
let AssetURL = "https://download-shop.s3.amazonaws.com/";
let AccountID;
let LoggedInEmail = "";
let Realtime;
let IsEditor = false;
let ShoppingCart = {};
let Purchases = [];
let OpenModal = "";
let ViewingItem = null;
const socket = new SimpleSocket({
    project_id: "61d8ccadb76d47c3571c5b22",
    project_token: "client_6758d65e8db5abcd5a1948eed4e57ef33b2"
});
function RealtimeUpdate(Data) {
    switch (Data.Task) {
    case "NewItem":
        if (Data.Item.Section == CurrentSort.toLowerCase()) {
            let ItemTileHolder = find("ItemTileHolder");
            if (ItemTileHolder != null) {
                let newTile = createTile(ItemTileHolder, Data.Item);
                if (ItemTileHolder.firstChild != null) {
                    ItemTileHolder.insertBefore(newTile, ItemTileHolder.firstChild);
                }
            }
        }
        break;
    case "CartAdd":
        ShoppingCart[Data.Item._id] = Data.Item;
        OpenModal = "";
        ViewCart();
        break;
    case "CartRemove":
        delete ShoppingCart[Data.ItemID];
        OpenModal = "";
        ViewCart();
        break;
    case "Checkout":
        ShoppingCart = {};
        let TopBarModal = find("TopBarModal");
        if (TopBarModal != null) {
            TopBarModal.remove();
        }
        PreviewBoughtItems(Data.Items, "Thank You ❤");
        break;
    case "EditItem":
        let Item = Data.Item;
        let Price = Item.Price || 0;
        let Color = "#12E497";
        if (Purchases.includes(Item._id) == true) {
            Price = "PURCHASED";
            Color = ThemeColors.BlueColor;
        } else if (Item.OnSale == false) {
            Price = "Offsale";
            Color = "#969696";
        } else if (Price == 0) {
            Price = "FREE";
        } else {
            let value = Number(Price);
            let res = String(Price).split(".");
            if (res.length == 1 || res[1].length < 3) {
                value = value.toFixed(2);
            }
            Price = "$" + value;
        }
        let FoundItemTile = find("ShopItemTile" + Item._id);
        if (FoundItemTile != null) {
            FoundItemTile.querySelector("#ShopTileItemName").textContent = Item.Name;
            FoundItemTile.querySelector("#ShopTilePrice").textContent = Price;
            FoundItemTile.querySelector("#ShopTilePrice").style.color = Color;
        }
        if (ShoppingCart[Item._id] != null) {
            ShoppingCart[Item._id] = Item;
            if (OpenModal == "ViewCart") {
                OpenModal = "";
                ViewCart();
            }
        }
        let BackBlur = find("ViewItemBackBlur");
        if (BackBlur != null && ViewingItem == Item._id) {
            BackBlur.remove();
            OpenItemView(Item._id);
        }
        break;
    case "StatChange":
        let StatKeys = Object.keys(Data.Stats);
        for (let i = 0; i < StatKeys.length; i++) {
            let StatElem = find(Data._id + StatKeys[i] + "Value");
            if (StatElem != null) {
                StatElem.textContent = parseInt(StatElem.textContent) + Data.Stats[StatKeys[i]];
            }
        }
        break;
    case "Realtime":
        Realtime = Data.Token;
        UpdateSubscribe();
        break;
    case "Email":
        LoggedInEmail = Data.Email;
    }
}
function PreviewBoughtItems(Items, Title) {
    OpenModal = "";
    let BackBlur = createElement("CheckoutBackBlur", "div", "body", {
        "position": "fixed",
        "width": "100%",
        "height": "100%",
        "backdrop-filter": "blur(12px)",
        "-webkit-backdrop-filter": "blur(12px)",
        "left": "0px",
        "top": "0px",
        "z-index": "50"
    });
    let JustPurchasedFrame = createElement("JustPurchasedFrame", "div", BackBlur, {
        "position": "relative",
        "width": "100%",
        "max-width": "350px",
        "max-height": "100%",
        "left": "50%",
        "top": "50%",
        "transform": "translate(-50%, -50%)",
        "overflow": "auto",
        "background-color": "#f7f7f7",
        "border-radius": "12px"
    });
    let TitleThanksHolder = createElement("TitleThanksHolder", "div", JustPurchasedFrame, {
        "display": "flex",
        "box-sizing": "border-box",
        "flex-wrap": "wrap",
        "width": "100%",
        "padding": "40px 8px 16px 8px",
        "justify-content": "center",
        "background-image": "linear-gradient(315deg, #63a4ff 0%, #83eaf1 74%)",
        "-webkit-clip-path": "polygon(0 0, 100% 0, 100% 56%, 0 100%); clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%)"
    });
    let CloseViewB = createElement("CloseViewB", "div", JustPurchasedFrame, {
        "position": "absolute",
        "display": "flex",
        "width": "32px",
        "height": "32px",
        "right": "10px",
        "top": "10px",
        "cursor": "pointer",
        "font-size": "60px",
        "line-height": "60px",
        "overflow-wrap": "break-word",
        "white-space": "pre-wrap",
        "font-family": Font,
        "color": "#ffffff",
        "font-weight": "400",
        "justify-content": "center",
        "align-items": "center"
    });
    CloseViewB.innerHTML = "&times;";
    CloseViewB.onmouseup = function() {
        BackBlur.remove();
        CloseBlobs();
    }
    createElement("TitleThanksHolder", "div", TitleThanksHolder, {
        "width": "100%",
        "font-size": "28px",
        "line-height": "32px",
        "font-family": Font,
        "font-weight": "600",
        "color": "#ffffff",
        "text-align": "center"
    }).textContent = Title;
    for (let i = 0; i < Items.length; i++) {
        let Item = Items[i];
        Purchases.push(Item._id);
        let PurchaseTile = createElement("PurchaseTile", "div", JustPurchasedFrame, {
            "position": "relative",
            "box-sizing": "border-box",
            "display": "flex",
            "margin": "8px",
            "padding": "6px",
            "background-color": "rgba(238, 238, 238)",
            "border-radius": "12px",
            "overflow": "hidden",
            "align-items": "center"
        });
        createElement("PurchaseThumbImage", "div", PurchaseTile, {
            "width": "36px",
            "height": "36px",
            "object-fit": "cover",
            "border-radius": "6px",
            "content": "url(" + AssetURL + "images/" + Item._id + "_Image0)"
        });
        createElement("PurchaseItemName", "div", PurchaseTile, {
            "margin-left": "4px",
            "font-size": "20px",
            "line-height": "20px",
            "font-family": Font,
            "font-weight": "800",
            "color": "#000000",
            "white-space": "pre"
        }).textContent = Item.Name;
        if (Title == "Your Purchases") {
            setCSS(PurchaseTile, "cursor", "pointer");
            PurchaseTile.setAttribute("onclick", "OpenItemView('" + Item._id + "')");
        } else {
            let DownloadButton = createElement("DownloadBoughtItemTile", "a", PurchaseTile, {
                "position": "absolute",
                "display": "flex",
                "width": "26px",
                "height": "100%",
                "right": "0px",
                "padding-right": "6px",
                "cursor": "pointer",
                "background-color": "rgb(238, 238, 238)",
                "box-shadow": "-5px 1px 5px 1px rgb(238, 238, 238)",
                "content": "url(./Images/Download.svg)"
            });
            DownloadButton.setAttribute("title", "Download Asset");
            DownloadButton.setAttribute("onclick", "async function Run() { let [ Status, Response ] = await SendRequest('GET', 'download?item=' + '" + Item._id + "'); if (Status == 200) { window.location = Response; } } Run();");
        }
        let FoundItemTile = find("ShopItemTile" + Item._id);
        if (FoundItemTile != null) {
            FoundItemTile.querySelector("#ShopTilePrice").textContent = "PURCHASED";
            FoundItemTile.querySelector("#ShopTilePrice").style.color = "#63a4ff";
        }
    }
    if (Items.length < 1) {
        let PurchaseTile = createElement("PurchaseTile", "div", JustPurchasedFrame, {
            "box-sizing": "border-box",
            "width": "100%",
            "padding": "6px",
            "font-size": "18px",
            "line-height": "24px",
            "font-family": Font,
            "font-weight": "600",
            "color": "#000000",
            "text-align": "center"
        }).textContent = "Nothing Yet...";
    } else {
        let TextureDownloadHolder = createElement("TitleThanksHolder", "div", JustPurchasedFrame, {
            "display": "flex",
            "box-sizing": "border-box",
            "flex-wrap": "wrap",
            "gap": "8px",
            "width": "100%",
            "margin-top": "8px",
            "padding": "8px",
            "background-color": "#cdcdcd",
            "justify-content": "center"
        });
        createElement("DownloadTextureImg", "img", TextureDownloadHolder, {
            "width": "100px",
            "height": "100px",
            "border-radius": "5px"
        }).src = "./Images/ColorPallet.png";
        let DownloadInfoHolder = createElement("TitleThanksHolder", "div", TextureDownloadHolder, {
            "display": "flex",
            "flex-wrap": "wrap",
            "flex": "1 1 200px",
            "justify-content": "center",
            "align-items": "center"
        });
        createElement("DownloadTextureTitle", "div", DownloadInfoHolder, {
            "width": "100%",
            "font-size": "20px",
            "line-height": "24px",
            "font-family": Font,
            "font-weight": "600",
            "color": "#ffffff",
            "text-align": "center"
        }).textContent = "Don’t forget your free color pallet!";
        let DownloadTextureButton = createElement("DownloadTextureButton", "a", DownloadInfoHolder, {
            "margin-top": "6px",
            "padding": "6px",
            "background-image": "linear-gradient(315deg, #22F2CC 0%, #29FFB8 74%)",
            "border-radius": "6px",
            "cursor": "pointer",
            "font-size": "18px",
            "line-height": "18px",
            "font-family": Font,
            "font-weight": "900",
            "color": "#ffffff",
            "text-align": "center",
            "text-decoration": "none"
        });
        DownloadTextureButton.textContent = "Download Pallet";
        DownloadTextureButton.href = "./Images/ColorPallet.png";
        DownloadTextureButton.setAttribute("target", "_blank");
    }
}
let UpdateSub = null;
function UpdateSubscribe() {
    let Filter = {
        App: "downloadshop-" + Shop,
        Type: "update"
    };
    if (LoggedInEmail != "") {
        Filter.Token = Realtime;
    }
    if (IsEditor == true && ViewingItem != null) {
        Filter.Item = ViewingItem;
    }
    if (UpdateSub == null) {
        UpdateSub = socket.subscribe(Filter, RealtimeUpdate);
    } else {
        UpdateSub.edit(Filter);
    }
}
let localDataStore = {};
function setLocalStore(key, data) {
    localDataStore[key] = data;
    try {
        localStorage.setItem(key, data);
    } catch {}
}
function getLocalStore(key) {
    let result = localDataStore[key];
    try {
        result = localStorage.getItem(key);
    } catch {}
    return result;
}
function removeLocalStore(key) {
    if (localDataStore[key]) {
        delete localDataStore[key];
    }
    try {
        localStorage.removeItem(key);
    } catch {}
}
let EpochOffset = 0;
function getEpoch() {
    return Date.now() + EpochOffset;
}
function ensureLogin() {
    let token = getLocalStore("Token");
    if (token == null) {
        return;
    }
    return token;
}
async function renewToken() {
    let refreshToken = await fetch(ServerURL + "auth/renew", {
        method: "POST",
        headers: {
            cache: "no-cache",
            "Content-Type": "text/plain"
        },
        body: JSON.stringify({
            UserID: getLocalStore("UserID"),
            Refresh: JSON.parse(ensureLogin()).Refresh
        })
    });
    if (refreshToken.status == 200) {
        let refreshData = JSON.parse(await refreshToken.text());
        setLocalStore("Token", JSON.stringify(refreshData.Token));
        Realtime = refreshData.Realtime;
        return refreshData.Token;
    } else {
        removeLocalStore("UserID");
        removeLocalStore("Token");
    }
}
async function SendRequest(Method, Path, Body, NoFileType) {
    let SendData = {
        method: Method,
        headers: {
            cache: 'no-cache'
        }
    };
    if (NoFileType != true) {
        SendData.headers["Content-Type"] = "text/plain";
    }
    if (Body != null) {
        SendData.body = Body;
    }
    let Token = localStorage.getItem("Token");
    if (Token != null) {
        Token = JSON.parse(Token);
        if (Token.Expires < Math.floor(getEpoch() / 1000)) {
            Token = (await renewToken()) || Token;
        }
        SendData.headers.auth = localStorage.getItem("UserID") + ";" + Token.Token;
    }
    let Response = await fetch(ServerURL + Path, SendData);
    if (Response.headers.has("date") == true) {
        let ServerTimeMillisGMT = new Date(Response.headers.get("date")).getTime();
        let LocalMillisUTC = new Date().getTime();
        EpochOffset = ServerTimeMillisGMT - LocalMillisUTC;
    }
    if (Response.status == 401) {
        renewToken();
    }
    return [Response.status, await Response.text()];
}
function PullObjectField(ArrObject, Field) {
    let ReturnObject = {};
    let ObjectKeys = Object.keys(ArrObject);
    for (let i = 0; i < ObjectKeys.length; i++) {
        let ObjData = ArrObject[ObjectKeys[i]];
        ReturnObject[ObjData[Field]] = ObjData;
    }
    return ReturnObject;
}
async function CheckForAlreadySignIn() {
    if (localStorage.getItem("Token") != null) {
        let[Status,Response] = await SendRequest("GET", "accountdetails");
        if (Status == 200) {
            Response = JSON.parse(Response);
            AccountID = Response.Account;
            LoggedInEmail = Response.Email;
            Realtime = Response.Realtime;
            if (Response.Cart != null) {
                ShoppingCart = PullObjectField(Response.Cart, "_id");
            }
            if (Response.Purchases != null) {
                Purchases = Response.Purchases;
            }
            if (Response.IsEditor == true) {
                IsEditor = true;
            }
            setCSS(ShoppingCartB, "display", "block");
        }
    }
    UpdateSubscribe();
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    let AssetLoad = urlParams.get("asset");
    if (AssetLoad != null) {
        OpenItemView(AssetLoad);
    }
    LoadTiles();
}
let BackgroundBackdrop = createElement("BackgroundBackdrop", "div", "body", {
    "position": "absolute",
    "width": "100%",
    "height": "499px",
    "top": "0px",
    "object-fit": "cover",
    "content": "url('../Images/Background.png')",
    "-webkit-clip-path": "polygon(0 0, 100% 0, 100% 56%, 0 100%); clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%)"
});
let BannerBackdrop = createElement("BannerBackdrop", "div", "body", {
    "position": "absolute",
    "width": "100%",
    "height": "500px",
    "top": "0px",
    "object-fit": "cover",
    "object-position": "center top",
    "background-color": "#63a4ff",
    "opacity": "0.85",
    "backdrop-filter": "blur(2px)",
    "background-image": "linear-gradient(315deg, #63a4ff 0%, #83eaf1 74%)",
    "-webkit-clip-path": "polygon(0 0, 100% 0, 100% 56%, 0 100%); clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%)"
});
let CoreApp = createElement("CoreApp", "div", "body", {
    "position": "absolute",
    "box-sizing": "border-box",
    "width": "1100px",
    "max-width": "100%",
    "min-height": "calc(100% - 36px)",
    "top": "36px",
    "left": "50%",
    "padding-bottom": "36px",
    "transform": "translateX(-50%)"
});
let SiteHeaderHolder = createElement("SiteHeaderHolder", "div", CoreApp, {
    "display": "flex",
    "box-sizing": "border-box",
    "flex-wrap": "wrap",
    "width": "100%",
    "height": "fit-content",
    "padding": "8px",
    "align-items": "center"
});
let RoBuilderImgHolder = createElement("RoBuilderImgHolder", "div", SiteHeaderHolder, {
    "flex": "1 1 300px",
    "max-width": "min(460px, 40vw)",
    "max-height": "550px"
});
let RoBuilderImg = createElement("RoBuilderImg", "img", RoBuilderImgHolder, {
    "object-fit": "scale-down",
    "width": "100%",
    "height": "100%"
});
RoBuilderImg.src = "./Images/RoBuilderClassic.png";
let StartContentHolder = createElement("StartContentHolder", "div", SiteHeaderHolder, {
    "flex": "1 1 300px",
    "min-height": "400px"
});
let RoBuildTitle = createElement("RoBuildTitle", "div", StartContentHolder, {
    "transform": "rotate(2deg)",
    "font-size": "clamp(24px, 60px, 16vw)",
    "line-height": "calc(clamp(24px, 60px, 16vw) + 10px)",
    "font-family": Font,
    "font-weight": "900",
    "color": "#ffffff"
});
RoBuildTitle.innerHTML = "Hey, I'm <span style='color: #3B96FF; -webkit-text-stroke: 2px #2868B0'>RoBuilder!</span>";
let RoBuildDesc = createElement("RoBuildDesc", "div", StartContentHolder, {
    "margin-top": "18px",
    "font-size": "22px",
    "line-height": "28px",
    "font-family": Font,
    "font-weight": "600"
});
RoBuildDesc.textContent = "Take a look at my collection of assets for use in your games!";
let SocialLinkHolder = createElement("SocialLinkHolder", "div", StartContentHolder, {
    "display": "flex",
    "flex-wrap": "wrap",
    "width": "calc(100% - 16px)",
    "margin": "24px 0px 0px 8px"
});
for (let i = 0; i < SocialLinks.length; i++) {
    let SocialData = SocialLinks[i];
    let NewSocialLink = createElement("NewSocialLink" + SocialData.Name, "a", SocialLinkHolder, {
        "display": "flex",
        "width": "fit-content",
        "padding": "4px",
        "margin": "4px",
        "background": "#fff",
        "border-radius": "20px",
        "text-decoration": "none",
        "align-items": "center"
    });
    if (SocialData.Link != null) {
        NewSocialLink.setAttribute("href", SocialData.Link);
        NewSocialLink.setAttribute("target", "_blank");
        NewSocialLink.setAttribute("title", SocialData.Link);
        setCSS(NewSocialLink, "cursor", "pointer");
    } else {
        NewSocialLink.setAttribute("title", SocialData.Name);
    }
    createElement("SocialCompanyIcon", "div", NewSocialLink, {
        "width": "28px",
        "height": "28px",
        "padding": "3px",
        "background": SocialData.Color,
        "border-radius": "17px",
        "content": "url(../Images/SocialLinks/" + SocialData.Site + ".svg)"
    });
    createElement("SocialLinkTx", "div", NewSocialLink, {
        "margin": "0px 8px",
        "font-size": "18px",
        "line-height": "20px",
        "font-family": Font,
        "font-weight": "500",
        "color": "#000"
    }).textContent = SocialData.Name;
}
function ResponsiveBackdrop() {
    let ClientRect = SocialLinkHolder.getBoundingClientRect();
    let TotalEndHeight = (ClientRect.y + window.scrollY) + ClientRect.height + 75;
    setCSS(BackgroundBackdrop, "height", "max(500px, " + TotalEndHeight + "px)");
    setCSS(BannerBackdrop, "height", "max(500px, " + TotalEndHeight + "px)");
}
window.addEventListener("resize", ResponsiveBackdrop);
RoBuilderImg.addEventListener("load", ResponsiveBackdrop);
ResponsiveBackdrop();
let PageTopBar = createElement("PageTopBar", "div", CoreApp, {
    "position": "sticky",
    "display": "flex",
    "flex-wrap": "wrap",
    "width": "100%)",
    "top": "0px",
    "align-items": "center",
    "margin-top": "16px",
    "z-index": "35",
    "background-color": "rgba(256, 256, 256, 0.8)",
    "backdrop-filter": "blur(10px)",
    "-webkit-backdrop-filter": "blur(10px)"
});
let SortBHolder = createElement("SortBHolder", "div", PageTopBar, {
    "display": "flex",
    "flex-wrap": "wrap"
});
for (let i = 0; i < SortSections.length; i++) {
    let Section = SortSections[i];
    let NewSortB = createElement("SortButton_" + Section, "div", SortBHolder, {
        "height": "min-content",
        "margin": "8px",
        "padding": "6px",
        "border-radius": "6px",
        "cursor": "pointer",
        "font-size": "20px",
        "line-height": "20px",
        "font-family": Font,
        "font-weight": "700",
        "color": "#000000",
        "text-align": "center",
        "justify-content": "center",
        "align-items": "center"
    });
    NewSortB.textContent = Section;
    NewSortB.setAttribute("onmouseup", "SortButtonClick(this)");
}
let AccountDetailsHolder = createElement("AccountDetailsHolder", "div", PageTopBar, {
    "display": "flex",
    "flex-wrap": "wrap",
    "margin-left": "auto",
    "padding": "3px"
});
let ShoppingCartB = createElement("ShoppingCartB", "div", AccountDetailsHolder, {
    "width": "36px",
    "height": "36px",
    "margin-right": "6px",
    "cursor": "pointer",
    "display": "none"
});
ShoppingCartB.innerHTML = '<svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"> <mask id="path-1-inside-1_304_2" fill="white"> <rect x="6" y="112" width="244" height="144" rx="17"/> </mask> <rect x="6" y="112" width="244" height="144" rx="17" stroke="black" stroke-width="40" mask="url(#path-1-inside-1_304_2)"/> <path d="M54 122L93 51" stroke="black" stroke-width="20" stroke-linecap="round"/> <path d="M202 122L163 51" stroke="black" stroke-width="20" stroke-linecap="round"/> <path d="M59 215V152" stroke="black" stroke-width="20" stroke-linecap="round"/> <path d="M105 215V153" stroke="black" stroke-width="20" stroke-linecap="round"/> <path d="M152 216V153" stroke="black" stroke-width="20" stroke-linecap="round"/> <path d="M198 216V154" stroke="black" stroke-width="20" stroke-linecap="round"/> </svg>';
ShoppingCartB.addEventListener("mouseup", ViewCart);
ShoppingCartB.setAttribute("title", "Cart");
let AccountB = createElement("AccountB", "div", AccountDetailsHolder, {
    "width": "36px",
    "height": "36px",
    "margin-right": "3px",
    "cursor": "pointer"
});
AccountB.innerHTML = '<svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"> <g clip-path="url(#clip0_102:25)"> <path d="M242 260C242 272.368 232.248 285.987 211.038 297.105C190.3 307.976 160.958 315 128 315C95.0417 315 65.6996 307.976 44.9615 297.105C23.7515 285.987 14 272.368 14 260C14 247.632 23.7515 234.013 44.9615 222.895C65.6996 212.024 95.0417 205 128 205C160.958 205 190.3 212.024 211.038 222.895C232.248 234.013 242 247.632 242 260Z" stroke="#000000" stroke-width="20"/> <circle cx="128" cy="105" r="63" stroke="#000000" stroke-width="20"/> </g> <defs> <clipPath id="clip0_102:25"> <rect width="256" height="256"/> </clipPath> </defs> </svg>';
AccountB.addEventListener("mouseup", ShopSignInUp);
AccountB.setAttribute("title", "Account");
function SortButtonClick(Element) {
    let SortPage = Element.id.replace(/SortButton\_/g, "");
    if (SortPage == CurrentSort) {
        ScrollToPageStart();
    } else {
        removeCSS("SortButton_" + CurrentSort, "background-image");
        setCSS("SortButton_" + CurrentSort, "color", "#000000");
        CurrentSort = SortPage;
        let NewSortPage = find("SortButton_" + SortPage);
        setCSS(NewSortPage, "background-image", "linear-gradient(315deg, #63a4ff 0%, #83eaf1 74%)");
        setCSS(NewSortPage, "color", "#ffffff");
        ScrollToPageStart();
        let PrevItemTileHolder = find("ItemTileHolder");
        if (PrevItemTileHolder != null) {
            PrevItemTileHolder.remove();
        }
        LoadTiles();
    }
}
setCSS("SortButton_" + CurrentSort, "background-image", "linear-gradient(315deg, #63a4ff 0%, #83eaf1 74%)");
setCSS("SortButton_" + CurrentSort, "color", "#ffffff");
function ScrollToPageStart() {
    let BoundRect = SiteHeaderHolder.getBoundingClientRect();
    window.scrollTo({
        top: BoundRect.height + 52,
        behavior: "smooth"
    });
}
function createTile(ItemTileHolder, Item) {
    let NewTile = createElement("ShopItemTile" + Item._id, "a", ItemTileHolder, {
        "margin": "6px",
        "flex": "1 1 300px",
        "max-width": "235px",
        "background-color": "rgba(246, 246, 246)",
        "border-radius": "8px",
        "overflow": "hidden",
        "cursor": "pointer"
    });
    NewTile.setAttribute("ItemID", Item._id);
    let ShopTileThumbImageHolder = createElement("ShopTileThumbImageHolder", "div", NewTile, {
        "display": "flex",
        "width": "100%",
        "height": "170px",
        "overflow": "hidden",
        "justify-content": "center",
        "align-items": "center"
    });
    createElement("ShopTileThumbImage", "div", ShopTileThumbImageHolder, {
        "width": "100%",
        "height": "100%",
        "object-fit": "cover",
        "transition": "all .15s ease",
        "content": "url(" + AssetURL + "images/" + Item._id + "_Image0)"
    });
    createElement("ShopTileItemName", "div", NewTile, {
        "box-sizing": "border-box",
        "width": "100%",
        "padding": "8px 8px 6px 8px",
        "font-size": "20px",
        "line-height": "20px",
        "font-family": Font,
        "font-weight": "800",
        "color": "#000000"
    }).textContent = Item.Name;
    let Price = Item.Price || 0;
    let Color = "#12E497";
    if (Purchases.includes(Item._id) == true) {
        Price = "PURCHASED";
        Color = ThemeColors.BlueColor;
    } else if (Item.OnSale == false) {
        Price = "Offsale";
        Color = "#969696";
    } else if (Price == 0) {
        Price = "FREE";
    } else {
        let value = Number(Price);
        let res = String(Price).split(".");
        if (res.length == 1 || res[1].length < 3) {
            value = value.toFixed(2);
        }
        Price = "$" + value;
    }
    createElement("ShopTilePrice", "div", NewTile, {
        "box-sizing": "border-box",
        "width": "100%",
        "padding": "0px 12px 8px 12px",
        "font-size": "17px",
        "line-height": "20px",
        "font-family": Font,
        "font-weight": "600",
        "color": Color
    }).textContent = Price;
    NewTile.setAttribute("onmouseup", "OpenItemView(this.getAttribute('ItemID'))");
    NewTile.setAttribute("onmouseover", "ImageZoomIn(this.querySelector('#ShopTileThumbImageHolder').querySelector('#ShopTileThumbImage'))");
    NewTile.setAttribute("onmouseout", "ImageZoomOut(this.querySelector('#ShopTileThumbImageHolder').querySelector('#ShopTileThumbImage'))");
    NewTile.setAttribute("scrollanim", "");
    return NewTile;
}
let ItemTileHolder = null;
let LoadMoreTiles = createElement("LoadMoreTiles", "div", CoreApp, {
    "display": "none",
    "justify-content": "center"
});
let LoadMoreTilesButton = createElement("LoadMoreTilesButton", "div", LoadMoreTiles, {
    "width": "fit-content",
    "box-sizing": "border-box",
    "margin": "16px 0px 16px 0px",
    "padding": "8px",
    "border-radius": "8px",
    "background-image": "linear-gradient(315deg, #63a4ff 0%, #83eaf1 74%)",
    "cursor": "pointer",
    "font-size": "20px",
    "line-height": "24px",
    "font-family": Font,
    "font-weight": "700",
    "color": "#ffffff"
});
LoadMoreTilesButton.textContent = "Load More";
LoadMoreTilesButton.addEventListener("mouseup", async function() {
    setCSS(LoadMoreTiles, "display", "none");
    let[Status,Response] = await SendRequest("GET", "items?sort=" + CurrentSort + "&after=" + LastTimestamp);
    if (Status == 200) {
        let Items = JSON.parse(Response);
        for (let i = 0; i < Items.length; i++) {
            createTile(ItemTileHolder, Items[i]);
        }
        if (Items.length > 0) {
            LastTimestamp = Items[Items.length - 1].Timestamp;
            if (Items.length > FullAmount - 1) {
                setCSS(LoadMoreTiles, "display", "flex");
            }
        }
    }
    SmoothScrollAnim();
});
async function LoadTiles() {
    ItemTileHolder = createElement("ItemTileHolder", "div", CoreApp, {
        "display": "flex",
        "flex-wrap": "wrap",
        "box-sizing": "border-box",
        "margin-bottom": "3px",
        "justify-content": "center"
    });
    CoreApp.insertBefore(ItemTileHolder, LoadMoreTiles);
    let SentSort = CurrentSort;
    let[Status,Response] = await SendRequest("GET", "items?sort=" + CurrentSort);
    if (Status == 200) {
        if (SentSort != CurrentSort) {
            return;
        }
        let Items = JSON.parse(Response);
        for (let i = 0; i < Items.length; i++) {
            createTile(ItemTileHolder, Items[i]);
        }
        if (Items.length > 0) {
            LastTimestamp = Items[Items.length - 1].Timestamp;
            if (Items.length > FullAmount - 1) {
                setCSS(LoadMoreTiles, "display", "flex");
            }
        }
    }
    SmoothScrollAnim();
}
function ImageZoomIn(Image) {
    Image.style.transform = "scale(1.15)";
}
function ImageZoomOut(Image) {
    Image.style.transform = "";
}
createElement("SiteCreditTx", "div", CoreApp, {
    "position": "absolute",
    "display": "flex",
    "box-sizing": "border-box",
    "width": "100%",
    "bottom": "0px",
    "padding": "8px 8px 8px 8px",
    "font-size": "18px",
    "line-height": "16px",
    "font-family": Font,
    "font-weight": "600",
    "color": "#000000",
    "justify-content": "center"
}).innerHTML = "<span style='margin-right: 4px'>Site made by</span><a href='https://twitter.com/Robot_Engine' target='_blank' style='color: #1DA1F2; text-decoration: none'>@Robot_Engine</a>";
function URLParams(Key, Value) {
    const Url = new URL(window.location);
    if (Value != null) {
        Url.searchParams.set(Key, Value);
    } else {
        Url.searchParams.delete(Key);
    }
    window.history.pushState({}, '', Url);
}
async function OpenItemView(ItemID) {
    let BackBlur = createElement("ViewItemBackBlur", "div", "body", {
        "position": "fixed",
        "width": "100%",
        "height": "100%",
        "backdrop-filter": "blur(12px)",
        "-webkit-backdrop-filter": "blur(12px)",
        "left": "0px",
        "top": "0px",
        "z-index": "50"
    });
    let ItemViewFrame = createElement("ItemViewFrame", "div", BackBlur, {
        "position": "relative",
        "opacity": "0",
        "width": "100%",
        "max-width": "800px",
        "max-height": "100%",
        "left": "50%",
        "top": "50%",
        "transform": "translate(-50%, -50%)",
        "transition": "all .15s ease",
        "overflow": "auto",
        "background-color": "#f7f7f7",
        "border-radius": "12px"
    });
    let updateSub = false;
    if (ViewingItem != ItemID) {
        ViewingItem = ItemID;
        updateSub = true;
    }
    let[Status,Response] = await SendRequest("GET", "details?item=" + ItemID);
    if (Status != 200) {
        BackBlur.remove();
        URLParams("asset");
        return;
    }
    let ItemData = JSON.parse(Response);
    let AnalyticStats = ItemData.Stats || {};
    if (updateSub) {
        ViewingItem = ItemID;
        UpdateSubscribe();
        AnalyticStats.Views = (AnalyticStats.Views || 0) + 1;
    }
    URLParams("asset", ItemID);
    ItemViewFrame.style.opacity = 1;
    let CloseViewB = createElement("CloseViewB", "div", ItemViewFrame, {
        "position": "absolute",
        "display": "flex",
        "width": "32px",
        "height": "32px",
        "right": "10px",
        "top": "10px",
        "cursor": "pointer",
        "font-size": "60px",
        "line-height": "60px",
        "overflow-wrap": "break-word",
        "white-space": "pre-wrap",
        "font-family": Font,
        "font-weight": "400",
        "justify-content": "center",
        "align-items": "center"
    });
    CloseViewB.innerHTML = "&times;";
    CloseViewB.onmouseup = function() {
        BackBlur.remove();
        URLParams("asset");
    }
    BackBlur.onmouseup = function(e) {
        if (e.target == BackBlur) {
            BackBlur.remove();
            URLParams("asset");
        }
    }
    ;
    let ItemDetailsHolder = createElement("ItemDetailsHolder", "div", ItemViewFrame, {
        "display": "flex",
        "box-sizing": "border-box",
        "flex-wrap": "wrap",
        "width": "100%",
        "padding": "50px 8px 2px 8px"
    });
    let ImagePrevHolder = createElement("ImagePrevHolder", "div", ItemDetailsHolder, {
        "flex": "1 1 200px"
    });
    let CurrentlyViewingImage = createElement("CurrentlyViewingImage", "img", ImagePrevHolder, {
        "width": "100%",
        "height": "350px",
        "object-fit": "cover",
        "border-radius": "8px",
        "transition": "all .1s ease"
    });
    CurrentlyViewingImage.src = AssetURL + "images/" + ItemData._id + "_Image0";
    let ImageHighlightWheel = createElement("ImageHighlightWheel", "div", ImagePrevHolder, {
        "display": "flex",
        "flex-wrap": "wrap",
        "width": "100%",
        "margin-top": "2px",
        "gap": "6px",
        "justify-content": "center"
    });
    if (ItemData.Images > 1) {
        for (let i = 0; i < ItemData.Images; i++) {
            let OtherImageSelect = createElement("OtherImageSelect", "img", ImageHighlightWheel, {
                "width": "50px",
                "height": "50px",
                "object-fit": "cover",
                "border-radius": "6px",
                "margin-bottom": "5px",
                "cursor": "pointer"
            });
            OtherImageSelect.src = AssetURL + "images/" + ItemData._id + "_Image" + i;
            OtherImageSelect.addEventListener("mouseup", async function(e) {
                CurrentlyViewingImage.style.opacity = 0;
                await sleep(125);
                CurrentlyViewingImage.src = e.target.src;
                CurrentlyViewingImage.style.opacity = 1;
            });
        }
    }
    let DetailsHolder = createElement("DetailsHolder", "div", ItemDetailsHolder, {
        "flex": "1 1 200px"
    });
    createElement("ShopItemName", "div", DetailsHolder, {
        "box-sizing": "border-box",
        "width": "100%",
        "padding": "8px",
        "font-size": "36px",
        "line-height": "42px",
        "font-family": Font,
        "font-weight": "800",
        "color": "#000000",
        "overflow-wrap": "anywhere"
    }).textContent = ItemData.Name;
    if (ItemData.Type != null) {
        createElement("ShopItemType", "div", DetailsHolder, {
            "box-sizing": "border-box",
            "width": "100%",
            "padding-left": "8px",
            "font-size": "18px",
            "line-height": "22px",
            "font-family": Font,
            "font-weight": "600",
            "color": "#000000"
        }).innerText = ItemData.Type;
    }
    if (ItemData.FileType != null) {
        createElement("ShopFileType", "div", DetailsHolder, {
            "box-sizing": "border-box",
            "width": "100%",
            "padding-left": "8px",
            "margin-top": "6px",
            "font-size": "18px",
            "line-height": "22px",
            "font-family": Font,
            "font-weight": "600",
            "color": "#000000"
        }).innerHTML = "Downloads as <span style='color: " + ThemeColors.BlueColor + "'>." + ItemData.FileType + "</span>";
    }
    let PriceItemsHolder = createElement("ShopTilePrice", "div", DetailsHolder, {
        "display": "flex",
        "flex-wrap": "wrap",
        "margin": "8px 12px 0px 12px",
        "align-items": "center"
    });
    let Price = "Offsale";
    let ColorSet = "#969696"
    if (ItemData.OnSale != false) {
        ColorSet = "#12E497"
        Price = ItemData.Price || 0;
        if (Price == 0) {
            Price = "FREE";
        } else {
            let value = Number(Price);
            let res = String(Price).split(".");
            if (res.length == 1 || res[1].length < 3) {
                value = value.toFixed(2);
            }
            Price = "$" + value;
        }
    }
    createElement("ShopItemPrice", "div", PriceItemsHolder, {
        "box-sizing": "border-box",
        "margin": "0px 8px 8px 0px",
        "font-size": "22px",
        "line-height": "26px",
        "font-family": Font,
        "font-weight": "600",
        "color": ColorSet
    }).textContent = Price;
    let AddToCartB = createElement("AddToCartB", "div", PriceItemsHolder, {
        "margin": "0px 8px 8px 0px",
        "padding": "6px",
        "border-radius": "6px",
        "cursor": "pointer",
        "font-size": "20px",
        "line-height": "20px",
        "font-family": Font,
        "font-weight": "900",
        "color": "#ffffff"
    });
    function ProcessInCart() {
        if (Purchases.includes(ItemID) == true) {
            AddToCartB.textContent = "Download";
            setCSS(AddToCartB, "background-image", "linear-gradient(315deg, #26FFDB 0%, #26FFB3 74%)");
            return;
        }
        if (ShoppingCart[ItemID] == null) {
            if (ItemData.OnSale == false) {
                setCSS(AddToCartB, "display", "none");
            }
            AddToCartB.textContent = "Add to Cart";
            setCSS(AddToCartB, "background-image", "linear-gradient(315deg, #63a4ff 0%, #83eaf1 74%)");
        } else {
            AddToCartB.textContent = "Remove from Cart";
            setCSS(AddToCartB, "background-image", "linear-gradient(315deg, #FF3126 0%, #FF4E26 74%)");
        }
    }
    AddToCartB.addEventListener("mouseup", async function() {
        BackBlur.remove();
        if (Purchases.includes(ItemID) == true) {
            let[Status,Response] = await SendRequest("GET", "download?item=" + ItemID);
            if (Status == 200) {
                window.location = Response;
            }
            return;
        }
        OpenModal = "";
        if (LoggedInEmail == "") {
            ShopSignInUp();
            return;
        }
        if (ShoppingCart[ItemID] == null) {
            ShoppingCart[ItemID] = ItemData;
            SendRequest("PATCH", "cart?item=" + ItemID);
        } else {
            delete ShoppingCart[ItemID];
            SendRequest("DELETE", "cart?item=" + ItemID);
        }
        ProcessInCart();
        ViewCart();
    });
    ProcessInCart();
    if (IsEditor == true) {
        let EditAssetB = createElement("EditAssetB", "div", PriceItemsHolder, {
            "margin-bottom": "8px",
            "padding": "6px",
            "border-radius": "6px",
            "cursor": "pointer",
            "background-color": "#969696",
            "font-size": "20px",
            "line-height": "20px",
            "font-family": Font,
            "font-weight": "900",
            "color": "#ffffff"
        });
        EditAssetB.textContent = "Edit";
        EditAssetB.addEventListener("mouseup", async function() {
            BackBlur.remove();
            LoadCreateItem(ItemData);
        });
    }
    if (ItemData.Desc != null) {
        createElement("ShopItemDesc", "div", DetailsHolder, {
            "box-sizing": "border-box",
            "width": "100%",
            "padding": "8px",
            "font-size": "14px",
            "line-height": "16px",
            "font-family": Font,
            "font-weight": "400",
            "color": "#000000",
            "overflow-wrap": "anywhere"
        }).innerText = ItemData.Desc;
    }
    if (IsEditor == true) {
        let AnalyticsHolder = createElement("AnalyticsHolder", "div", DetailsHolder, {
            "display": "flex",
            "flex-wrap": "wrap",
            "margin": "8px 8px 8px 8px",
            "align-items": "center"
        });
        for (let i = 0; i < StatNames.length; i++) {
            let Stat = StatNames[i];
            let Value = AnalyticStats[Stat] || 0;
            let StatHolder = createElement(Stat + "StatHolder", "div", AnalyticsHolder, {
                "display": "flex",
                "padding": "8px",
                "align-items": "baseline"
            });
            if (Stat == "Earnings") {
                createElement(ItemData._id + "DollarSign", "div", StatHolder, {
                    "font-size": "20px",
                    "line-height": "24px",
                    "font-family": Font,
                    "font-weight": "600",
                    "color": "#000000",
                    "overflow-wrap": "anywhere"
                }).textContent = "$";
                Value = Number(Value);
                let res = String(Value).split(".");
                if (res.length == 1 || res[1].length < 3) {
                    Value = Value.toFixed(2);
                }
            }
            createElement(ItemData._id + Stat + "Value", "div", StatHolder, {
                "font-size": "20px",
                "line-height": "24px",
                "font-family": Font,
                "font-weight": "600",
                "color": "#000000",
                "overflow-wrap": "anywhere"
            }).textContent = Value;
            createElement(Stat + "Name", "div", StatHolder, {
                "margin-left": "3px",
                "font-size": "14px",
                "line-height": "16px",
                "font-family": Font,
                "font-weight": "400",
                "color": "#000000",
                "overflow-wrap": "anywhere"
            }).textContent = " " + Stat;
        }
    }
}
function CreateErrorTx(Parent, After, Error) {
    let ErrorTx = find("ErrorTxt" + Error);
    if (ErrorTx != null) {
        ErrorTx.remove();
    }
    if (After != null) {
        ErrorTx = createElement("ErrorTxt" + Error, "div", Parent, {
            "width": "calc(100% - 16px)",
            "font-size": "13px",
            "font-family": Font,
            "font-weight": "500",
            "color": "#F22245",
            "overflow": "auto",
            "text-align": "center"
        });
        ErrorTx.textContent = Error;
        if (After.nextSibling != null) {
            Parent.insertBefore(ErrorTx, After.nextSibling);
        }
        return ErrorTx;
    }
}
let BlobURLs = [];
function CloseBlobs() {
    for (let i = 0; i < BlobURLs.length; i++) {
        URL.revokeObjectURL(BlobURLs[i]);
    }
    BlobURLs = [];
}
function LoadCreateItem(EditDetails) {
    let EditData = EditDetails || {};
    let BackBlur = createElement("CreateItemBackBlur", "div", "body", {
        "position": "fixed",
        "width": "100%",
        "height": "100%",
        "backdrop-filter": "blur(12px)",
        "-webkit-backdrop-filter": "blur(12px)",
        "left": "0px",
        "top": "0px",
        "z-index": "50"
    });
    let ItemViewFrame = createElement("ItemViewFrame", "div", BackBlur, {
        "position": "relative",
        "width": "100%",
        "max-width": "500px",
        "max-height": "100%",
        "left": "50%",
        "top": "50%",
        "transform": "translate(-50%, -50%)",
        "overflow": "auto",
        "background-color": "#f7f7f7",
        "border-radius": "12px"
    });
    let CloseViewB = createElement("CloseViewB", "div", ItemViewFrame, {
        "position": "absolute",
        "display": "flex",
        "width": "32px",
        "height": "32px",
        "right": "10px",
        "top": "10px",
        "cursor": "pointer",
        "font-size": "60px",
        "line-height": "60px",
        "overflow-wrap": "break-word",
        "white-space": "pre-wrap",
        "font-family": Font,
        "font-weight": "400",
        "justify-content": "center",
        "align-items": "center"
    });
    CloseViewB.innerHTML = "&times;";
    CloseViewB.onmouseup = function() {
        BackBlur.remove();
        CloseBlobs();
    }
    let DetailsHolder = createElement("DetailsHolder", "div", ItemViewFrame, {
        "display": "flex",
        "box-sizing": "border-box",
        "flex-wrap": "wrap",
        "width": "100%",
        "padding": "50px 8px 8px 8px",
        "justify-content": "center"
    });
    createElement("ShopTitleTx", "div", DetailsHolder, {
        "box-sizing": "border-box",
        "width": "100%",
        "padding": "8px",
        "font-size": "20px",
        "line-height": "24px",
        "font-family": Font,
        "font-weight": "800",
        "color": "#000000",
        "overflow-wrap": "anywhere"
    }).textContent = "Item Title:";
    let TextFieldItemName = createElement("TextFieldItemName", "input", DetailsHolder, {
        "box-sizing": "border-box",
        "width": "80%",
        "padding": "4px 4px 4px 6px",
        "background-color": "#f0f0f0",
        "border-width": "0px",
        "border-radius": "8px",
        "font-size": "18px",
        "font-family": Font,
        "font-weight": "600",
        "color": "#000000",
        "overflow": "auto"
    });
    TextFieldItemName.placeholder = "Item Name";
    TextFieldItemName.setAttribute("title", "Item Name");
    TextFieldItemName.addEventListener("input", function() {
        let ErrorText = "Name is too long! (Must be less than 40 characters)";
        if (TextFieldItemName.value.length > 39) {
            CreateErrorTx(DetailsHolder, TextFieldItemName, ErrorText);
        } else {
            CreateErrorTx(DetailsHolder, null, ErrorText);
        }
    });
    if (EditData.Name != null) {
        TextFieldItemName.value = EditData.Name;
    }
    createElement("ShopTitleTx", "div", DetailsHolder, {
        "box-sizing": "border-box",
        "width": "100%",
        "padding": "8px",
        "font-size": "20px",
        "line-height": "24px",
        "font-family": Font,
        "font-weight": "800",
        "color": "#000000",
        "overflow-wrap": "anywhere"
    }).textContent = "Thumbnail Images:";
    let ImageHighlightWheel = createElement("UploadImageHighlightWheel", "div", DetailsHolder, {
        "display": "flex",
        "flex-wrap": "wrap",
        "width": "100%",
        "gap": "6px",
        "justify-content": "center"
    });
    let UploadNewImgB = createElement("UploadNewImgB", "div", ImageHighlightWheel, {
        "display": "flex",
        "width": "50px",
        "height": "50px",
        "border-radius": "6px",
        "background-color": "#f0f0f0",
        "cursor": "pointer",
        "font-size": "45px",
        "line-height": "45px",
        "font-family": Font,
        "font-weight": "600",
        "color": "#000000",
        "justify-content": "center",
        "align-items": "center"
    });
    UploadNewImgB.textContent = "+";
    let ImageFileUpload = createElement("ImageFileUpload", "input", UploadNewImgB, {
        "position": "absolute",
        "height": "100%",
        "width": "100%",
        "left": "0px",
        "top": "0px"
    });
    ImageFileUpload.setAttribute("type", "file");
    ImageFileUpload.setAttribute("accept", "image/*");
    ImageFileUpload.setAttribute("hidden", "true");
    ImageFileUpload.setAttribute("multiple", "true");
    ImageFileUpload.addEventListener('change', function(event) {
        for (let i = 0; i < event.target.files.length; i++) {
            let File = event.target.files[i];
            let ErrorText = "Must be an image!";
            if (File.type.substring(0, 6) != "image/") {
                CreateErrorTx(DetailsHolder, ImageHighlightWheel, ErrorText);
                return;
            } else {
                CreateErrorTx(DetailsHolder, null, ErrorText);
            }
            let BigErrorText = "Must be smaller than 4 MB.";
            if (File.size > 4 * 1024 * 1024) {
                CreateErrorTx(DetailsHolder, ImageHighlightWheel, BigErrorText);
                return;
            } else {
                CreateErrorTx(DetailsHolder, null, BigErrorText);
            }
            let ManyErrorText = "Maximum of 7 images!";
            if (ImageHighlightWheel.childElementCount > 7) {
                CreateErrorTx(DetailsHolder, ImageHighlightWheel, ManyErrorText);
                return;
            } else {
                CreateErrorTx(DetailsHolder, null, ManyErrorText);
            }
            let BlobURL = URL.createObjectURL(File);
            BlobURLs.push(BlobURL);
            let NewImageSelect = createElement("NewImageSelect", "div", ImageHighlightWheel, {
                "position": "relative",
                "width": "50px",
                "height": "50px"
            });
            let Image = createElement("NewImageSelect", "div", NewImageSelect, {
                "position": "absolute",
                "width": "100%",
                "height": "100%",
                "object-fit": "cover",
                "border-radius": "6px",
                "content": "url(" + BlobURL + ")"
            });
            NewImageSelect.setAttribute("BlobURL", BlobURL);
            let CloseImageB = createElement("CloseImageB", "div", NewImageSelect, {
                "position": "absolute",
                "display": "flex",
                "width": "25px",
                "height": "25px",
                "top": "50%",
                "left": "50%",
                "transform": "translate(-50%, -50%)",
                "border-radius": "100%",
                "background-color": "rgba(0, 0, 0, 0.45)",
                "cursor": "pointer",
                "font-size": "24px",
                "font-family": Font,
                "font-weight": "200",
                "color": "#ffffff",
                "justify-content": "center",
                "align-items": "center"
            });
            CloseImageB.innerHTML = "&times;";
            ImageHighlightWheel.insertBefore(NewImageSelect, UploadNewImgB);
            CloseImageB.addEventListener("mouseup", function(e) {
                NewImageSelect.remove();
                URL.revokeObjectURL(e.path[0].getAttribute("BlobURL"));
                BlobURLs.splice(BlobURLs.indexOf(e.path[0].getAttribute("BlobURL")));
            });
        }
    });
    UploadNewImgB.addEventListener("mouseup", function() {
        ImageFileUpload.click();
    });
    if (EditData.Images != null) {
        for (let i = 0; i < EditData.Images; i++) {
            let NewImageSelect = createElement("NewImageSelect", "div", ImageHighlightWheel, {
                "position": "relative",
                "width": "50px",
                "height": "50px"
            });
            let Image = createElement("NewImageSelect", "div", NewImageSelect, {
                "position": "absolute",
                "width": "100%",
                "height": "100%",
                "object-fit": "cover",
                "border-radius": "6px",
                "content": "url(" + AssetURL + "images/" + EditData._id + "_Image" + i + ")"
            });
            NewImageSelect.setAttribute("Uploaded", "");
            let CloseImageB = createElement("CloseImageB", "div", NewImageSelect, {
                "position": "absolute",
                "display": "flex",
                "width": "25px",
                "height": "25px",
                "top": "50%",
                "left": "50%",
                "transform": "translate(-50%, -50%)",
                "border-radius": "100%",
                "background-color": "rgba(0, 0, 0, 0.45)",
                "cursor": "pointer",
                "font-size": "24px",
                "font-family": Font,
                "font-weight": "200",
                "color": "#ffffff",
                "justify-content": "center",
                "align-items": "center"
            });
            CloseImageB.innerHTML = "&times;";
            ImageHighlightWheel.insertBefore(NewImageSelect, UploadNewImgB);
            CloseImageB.addEventListener("mouseup", function(e) {
                NewImageSelect.remove();
            });
        }
    }
    createElement("ShopTitleTx", "div", DetailsHolder, {
        "box-sizing": "border-box",
        "width": "100%",
        "padding": "8px",
        "font-size": "20px",
        "line-height": "24px",
        "font-family": Font,
        "font-weight": "800",
        "color": "#000000",
        "overflow-wrap": "anywhere"
    }).textContent = "Item Description:";
    let TextFieldDesc = createElement("TextFieldDesc", "div", DetailsHolder, {
        "box-sizing": "border-box",
        "width": "90%",
        "padding": "4px 4px 4px 6px",
        "background-color": "#f0f0f0",
        "border-width": "0px",
        "border-radius": "8px",
        "min-height": "60px",
        "font-size": "16px",
        "font-family": Font,
        "font-weight": "400",
        "color": "#000000",
        "overflow": "auto"
    });
    TextFieldDesc.setAttribute("role", "textbox");
    TextFieldDesc.setAttribute("contenteditable", "true");
    TextFieldDesc.setAttribute("tabindex", "-1");
    TextFieldDesc.setAttribute("title", "Item Description");
    TextFieldDesc.addEventListener("input", function() {
        let ErrorText = "Description is too long! (Must be less than 300 characters)";
        if (TextFieldDesc.textContent.length > 299) {
            CreateErrorTx(DetailsHolder, TextFieldDesc, ErrorText);
        } else {
            CreateErrorTx(DetailsHolder, null, ErrorText);
        }
    });
    if (EditData.Desc != null) {
        TextFieldDesc.textContent = EditData.Desc;
    }
    createElement("ShopTitleTx", "div", DetailsHolder, {
        "box-sizing": "border-box",
        "width": "100%",
        "padding": "8px",
        "font-size": "20px",
        "line-height": "24px",
        "font-family": Font,
        "font-weight": "800",
        "color": "#000000",
        "overflow-wrap": "anywhere"
    }).textContent = "Model Upload:";
    let UploadFileB = createElement("UploadFileB", "div", DetailsHolder, {
        "padding": "10px",
        "background-image": "linear-gradient(315deg, #22F2CC 0%, #29FFB8 74%)",
        "border-radius": "6px",
        "cursor": "pointer",
        "font-size": "20px",
        "line-height": "20px",
        "font-family": Font,
        "font-weight": "900",
        "color": "#ffffff",
        "text-align": "center"
    });
    UploadFileB.textContent = "Upload Model File";
    let FileUpload = createElement("LoadImageButton", "input", UploadFileB, {
        "position": "absolute",
        "height": "100%",
        "width": "100%",
        "left": "0px",
        "top": "0px"
    });
    FileUpload.setAttribute("type", "file");
    FileUpload.setAttribute("hidden", "true");
    let FileBlobUpload = null;
    let FileName = null;
    FileUpload.addEventListener('change', function(event) {
        let File = event.target.files[0];
        let BigErrorText = "Must be smaller than 10 MB.";
        if (File.size > 10 * 1024 * 1024) {
            CreateErrorTx(DetailsHolder, UploadFileB, BigErrorText);
            return;
        } else {
            CreateErrorTx(DetailsHolder, null, BigErrorText);
        }
        if (FileBlobUpload != null) {
            URL.revokeObjectURL(FileBlobUpload);
            BlobURLs.splice(BlobURLs.indexOf(FileBlobUpload));
        }
        FileBlobUpload = URL.createObjectURL(File);
        FileName = File.name;
        BlobURLs.push(FileBlobUpload);
        let SuccTx = createElement("ErrorTxt" + BigErrorText, "div", DetailsHolder, {
            "width": "calc(100% - 16px)",
            "font-size": "13px",
            "font-family": Font,
            "font-weight": "500",
            "color": "#29FFB8",
            "overflow": "auto",
            "text-align": "center"
        });
        SuccTx.textContent = "Uploaded " + File.name;
        DetailsHolder.insertBefore(SuccTx, UploadFileB.nextSibling);
    });
    UploadFileB.addEventListener("mouseup", function() {
        FileUpload.click();
    });
    createElement("ShopTitleTx", "div", DetailsHolder, {
        "box-sizing": "border-box",
        "width": "100%",
        "padding": "8px 8px 0px 8px",
        "font-size": "20px",
        "line-height": "24px",
        "font-family": Font,
        "font-weight": "800",
        "color": "#000000",
        "overflow-wrap": "anywhere"
    }).textContent = "Price:";
    createElement("DollarSignB", "div", DetailsHolder, {
        "display": "inline-block",
        "box-sizing": "border-box",
        "margin-top": "6px",
        "padding": "6px",
        "font-size": "26px",
        "line-height": "26px",
        "font-family": Font,
        "font-weight": "500",
        "color": "#12E497"
    }).textContent = "$";
    let TextFieldPrice = createElement("TextFieldPrice", "input", DetailsHolder, {
        "display": "inline-block",
        "box-sizing": "border-box",
        "width": "100px",
        "margin-top": "6px",
        "padding": "4px 4px 4px 6px",
        "background-color": "#f0f0f0",
        "border-width": "0px",
        "border-radius": "8px",
        "font-size": "18px",
        "font-family": Font,
        "font-weight": "600",
        "color": "#000000",
        "overflow": "auto"
    });
    TextFieldPrice.placeholder = "0.00";
    TextFieldPrice.setAttribute("type", "number");
    TextFieldPrice.setAttribute("min", "0.00");
    TextFieldPrice.setAttribute("step", "0.01");
    TextFieldPrice.setAttribute("max", "2500");
    TextFieldPrice.setAttribute("title", "Item Price");
    if (EditData.Price != null) {
        TextFieldPrice.value = EditData.Price;
    }
    let OnSaleDropdown = createElement("OnSaleDropdown", "select", DetailsHolder, {
        "box-sizing": "border-box",
        "width": "110px",
        "height": "38px",
        "margin": "6px 0px 0px 6px",
        "border-radius": "8px",
        "border-width": "0px",
        "background-color": "#f0f0f0",
        "font-size": "20px",
        "line-height": "24px",
        "font-family": Font,
        "font-weight": "600",
        "color": "#000000",
        "overflow-wrap": "anywhere"
    });
    let InnerSetHTML = "";
    let SaleSections = ["On Sale", "Offsale"];
    for (let c = 0; c < SaleSections.length; c++) {
        let ClassName = SaleSections[c];
        InnerSetHTML += "<option value='" + ClassName + "'>" + ClassName + "</option>";
    }
    OnSaleDropdown.innerHTML = InnerSetHTML;
    if (EditData.OnSale == false) {
        OnSaleDropdown.value = "Offsale";
    }
    createElement("ShopTitleTx", "div", DetailsHolder, {
        "box-sizing": "border-box",
        "width": "100%",
        "padding": "8px",
        "font-size": "20px",
        "line-height": "24px",
        "font-family": Font,
        "font-weight": "800",
        "color": "#000000",
        "overflow-wrap": "anywhere"
    }).textContent = "Extra Settings:";
    let CategoryDropdown = createElement("CategoryDropdown", "select", DetailsHolder, {
        "box-sizing": "border-box",
        "width": "calc(50% - 12px)",
        "height": "38px",
        "border-radius": "8px",
        "border-width": "0px",
        "background-color": "#f0f0f0",
        "font-size": "20px",
        "line-height": "24px",
        "font-family": Font,
        "font-weight": "600",
        "color": "#000000",
        "overflow-wrap": "anywhere"
    });
    InnerSetHTML = "";
    for (let c = 0; c < SortSections.length; c++) {
        let ClassName = SortSections[c];
        InnerSetHTML += "<option value='" + ClassName + "'>" + ClassName + "</option>";
    }
    CategoryDropdown.innerHTML = InnerSetHTML;
    if (EditData.Section != null) {
        CategoryDropdown.value = EditData.Section[0].toUpperCase() + EditData.Section.substring(1);
    }
    let TypeInput = createElement("TypeInput", "input", DetailsHolder, {
        "box-sizing": "border-box",
        "width": "calc(50% - 12px)",
        "height": "38px",
        "margin-left": "8px",
        "padding-left": "8px",
        "border-radius": "8px",
        "border-width": "0px",
        "background-color": "#f0f0f0",
        "font-size": "20px",
        "line-height": "24px",
        "font-family": Font,
        "font-weight": "600",
        "color": "#000000",
        "overflow-wrap": "anywhere"
    });
    TypeInput.placeholder = "Type";
    TypeInput.setAttribute("title", "Item Type");
    if (EditData.Type != null) {
        TypeInput.value = EditData.Type;
    }
    let CreateItemB = createElement("CreateItemB", "div", DetailsHolder, {
        "padding": "12px",
        "margin-top": "12px",
        "background-image": "linear-gradient(315deg, #63a4ff 0%, #83eaf1 74%)",
        "border-radius": "6px",
        "cursor": "pointer",
        "font-size": "24px",
        "line-height": "24px",
        "font-family": Font,
        "font-weight": "900",
        "color": "#ffffff",
        "text-align": "center"
    });
    if (EditData._id == null) {
        CreateItemB.textContent = "Create Item";
    } else {
        CreateItemB.textContent = "Save Edits";
    }
    CreateItemB.addEventListener("mouseup", async function() {
        let NoNameErrorText = "Must have an item name!";
        if (TextFieldItemName.value.length < 1) {
            CreateErrorTx(DetailsHolder, CreateItemB, NoNameErrorText);
            return;
        } else {
            CreateErrorTx(DetailsHolder, null, NoNameErrorText);
        }
        let NoImageErrorText = "Must have at least 1 image!";
        if (ImageHighlightWheel.childElementCount < 2) {
            CreateErrorTx(DetailsHolder, CreateItemB, NoImageErrorText);
            return;
        } else {
            CreateErrorTx(DetailsHolder, null, NoImageErrorText);
        }
        let NoFileErrorText = "Must upload a the model!";
        if (FileBlobUpload == null && EditData == null) {
            CreateErrorTx(DetailsHolder, CreateItemB, NoFileErrorText);
            return;
        } else {
            CreateErrorTx(DetailsHolder, null, NoFileErrorText);
        }
        let SendData = {
            Name: TextFieldItemName.value,
            Price: TextFieldPrice.value,
            Section: CategoryDropdown.value,
            OnSale: OnSaleDropdown.value == "On Sale"
        };
        if (TextFieldDesc.innerText.length > 0) {
            SendData.Description = TextFieldDesc.innerText;
        }
        if (TypeInput.value.length > 0) {
            SendData.Type = TypeInput.value;
        }
        let SendFormData = new FormData();
        SendFormData.append("RequestData", JSON.stringify(SendData));
        if (FileBlobUpload != null) {
            await fetch(FileBlobUpload).then(async function(file) {
                SendFormData.append("File", await file.blob());
                SendFormData.append("FileName", FileName);
            });
        }
        let ImageChilds = ImageHighlightWheel.children;
        for (let i = 0; i < ImageChilds.length; i++) {
            if (ImageChilds[i].hasAttribute("BlobURL") == true) {
                await fetch(ImageChilds[i].getAttribute("BlobURL")).then(async function(file) {
                    SendFormData.append("Image" + i, await file.blob());
                });
            } else if (ImageChilds[i].hasAttribute("Uploaded") == true) {
                SendFormData.append("Image" + i, "UPLOADED");
            }
        }
        function SendingChange(Text) {
            CreateItemB.remove();
            let SuccTx = createElement("WorkingTx", "div", DetailsHolder, {
                "width": "calc(100% - 16px)",
                "font-size": "16px",
                "font-family": Font,
                "font-weight": "500",
                "color": "#29FFB8",
                "overflow": "auto",
                "text-align": "center"
            });
            SuccTx.textContent = Text;
        }
        if (EditData._id == null) {
            SendingChange("Creating asset...");
            await SendRequest("POST", "createasset", SendFormData, true);
        } else {
            SendingChange("Updating asset...");
            let[Status,Response] = await SendRequest("PATCH", "editasset?item=" + EditData._id, SendFormData, true);
            if (Status == 200) {
                OpenItemView(EditData._id);
            }
        }
        BackBlur.remove();
        CloseBlobs();
        URLParams("asset");
    });
}
let SignInUpFrame = null;
let SignInUpBHolder = null;
let SignUpB
let TextFieldAccEmail = null;
let TextFieldAccPassword = null;
async function SetCaptchaData(CaptData) {
    let[Status,Response] = await SendRequest("POST", "signup", JSON.stringify({
        Email: TextFieldAccEmail.value,
        Password: TextFieldAccPassword.value,
        Captcha: CaptData
    }));
    if (Status == 200) {
        TextFieldAccEmail.value = "";
        TextFieldAccPassword.value = "";
        Response = JSON.parse(Response);
        localStorage.setItem("UserID", Response._id);
        localStorage.setItem("Token", JSON.stringify(Response.Token));
        LoggedInEmail = Response.Email;
        UpdateSubscribe();
        if (Response.Cart != null) {
            ShoppingCart = PullObjectField(Response.Cart, "_id");
        }
        if (Response.Purchases != null) {
            Purchases = Response.Purchases;
        }
        if (Response.IsEditor == true) {
            IsEditor = true;
        }
        setCSS(ShoppingCartB, "display", "block");
        SignInUpFrame.remove();
        OpenModal = "";
        let PrevItemTileHolder = find("ItemTileHolder");
        if (PrevItemTileHolder != null) {
            PrevItemTileHolder.remove();
        }
        LoadTiles();
    } else {
        SetCaptchaExpired();
        let InvalidRequest = find("InvalidRequest");
        if (InvalidRequest != null) {
            InvalidRequest.remove();
        }
        InvalidRequest = createElement("InvalidRequest", "div", SignInUpFrame, {
            "width": "80%",
            "margin-left": "calc(10% + 8px)",
            "font-size": "13px",
            "font-family": Font,
            "font-weight": "500",
            "color": "#F22245",
            "overflow": "auto"
        });
        InvalidRequest.textContent = Response || "An error occured...";
    }
}
function SetCaptchaExpired() {
    if (typeof hcaptcha != 'undefined') {
        hcaptcha.reset();
    }
}
window.addEventListener("message", async(event)=>{
    if (event.data == "oauth_embed_integration") {
        event.source.postMessage("subscribe_oauth_finish", "*");
    } else if (event.origin === "https://exotek.co") {
        let parsedData = JSON.parse(event.data);
        if (parsedData.type == "oauth_finish") {
            window.loginWindow.close();
            if (parsedData.code != null && parsedData.state != null) {
                if (parsedData.state != getLocalStore("state")) {
                    return;
                }
                removeLocalStore("state");
                let[Code,Response] = await SendRequest("POST", "auth/login", JSON.stringify({
                    code: parsedData.code
                }));
                if (Code == 200) {
                    Response = JSON.parse(Response);
                    localStorage.setItem("UserID", Response._id);
                    localStorage.setItem("Token", JSON.stringify(Response.Token));
                    AccountID = Response.Account;
                    LoggedInEmail = Response.Email;
                    Realtime = Response.Realtime;
                    UpdateSubscribe();
                    if (Response.Cart != null) {
                        ShoppingCart = PullObjectField(Response.Cart, "_id");
                    }
                    if (Response.Purchases != null) {
                        Purchases = Response.Purchases;
                    }
                    if (Response.IsEditor == true) {
                        IsEditor = true;
                    }
                    setCSS(ShoppingCartB, "display", "block");
                    let PrevItemTileHolder = find("ItemTileHolder");
                    if (PrevItemTileHolder != null) {
                        PrevItemTileHolder.remove();
                    }
                    LoadTiles();
                }
            }
        }
    }
}
);
function randomString(l) {
    var s = "";
    var randomchar = function() {
        var n = Math.floor(Math.random() * 62);
        if (n < 10)
            return n;
        if (n < 36)
            return String.fromCharCode(n + 55);
        return String.fromCharCode(n + 61);
    };
    while (s.length < l)
        s += randomchar();
    return s;
}
function ShopSignInUp() {
    let TopBarModal = find("TopBarModal");
    if (TopBarModal != null) {
        TopBarModal.remove();
    }
    if (LoggedInEmail == "") {
        let randomStr = randomString(20);
        setLocalStore("state", randomStr);
        window.loginWindow = window.open("https://exotek.co/login?client_id=6413d8246524a756525067bd&redirect_uri=https%3A%2F%2F" + window.location.host + "&response_type=code&scope=userinfo&state=" + randomStr, location.host + "_authenticate", "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=1000, height=650, top=" + ((screen.height / 2) - 425) + ", left=" + ((screen.width / 2) - 500));
    } else {
        if (OpenModal == "SignInUp") {
            OpenModal = "";
            return;
        }
        OpenModal = "SignInUp";
        let ViewAccountFrame = createElement("TopBarModal", "div", PageTopBar, {
            "position": "absolute",
            "width": "100%",
            "max-width": "250px",
            "max-height": "calc(100vh - 100%)",
            "right": "0px",
            "top": "100%",
            "overflow": "auto",
            "background-color": "#ffffff",
            "border-bottom-left-radius": "12px",
            "border-bottom-right-radius": "12px",
            "backdrop-filter": "blur(12px)",
            "-webkit-backdrop-filter": "blur(12px)",
            "box-shadow": "0 6px 20px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.1)"
        });
        createElement("EmailDisplay", "div", ViewAccountFrame, {
            "box-sizing": "border-box",
            "width": "100%",
            "padding": "6px",
            "border-width": "0px 0px 2px 0px",
            "border-style": "solid",
            "border-color": "#cccccc",
            "font-size": "14px",
            "line-height": "20px",
            "font-family": Font,
            "font-weight": "400",
            "color": "#bbbbbb",
            "text-align": "center",
            "overflow-wrap": "anywhere"
        }).textContent = LoggedInEmail;
        if (IsEditor == true) {
            let CreateItemB = createElement("CreateItemB", "div", ViewAccountFrame, {
                "box-sizing": "border-box",
                "width": "100%",
                "padding": "6px",
                "cursor": "pointer",
                "font-size": "16px",
                "line-height": "20px",
                "font-family": Font,
                "font-weight": "700",
                "color": "#000000",
                "text-align": "center",
                "overflow-wrap": "anywhere"
            });
            CreateItemB.textContent = "Create Asset";
            CreateItemB.onclick = LoadCreateItem;
        }
        let ViewPurchasesB = createElement("ViewPurchasesB", "div", ViewAccountFrame, {
            "box-sizing": "border-box",
            "width": "100%",
            "padding": "6px",
            "cursor": "pointer",
            "font-size": "16px",
            "line-height": "20px",
            "font-family": Font,
            "font-weight": "700",
            "color": "#000000",
            "text-align": "center",
            "overflow-wrap": "anywhere"
        });
        ViewPurchasesB.textContent = "View Purchases";
        ViewPurchasesB.addEventListener("click", async function() {
            ViewAccountFrame.remove();
            OpenModal = "";
            let[Status,Response] = await SendRequest("GET", "purchases");
            if (Status == 200) {
                PreviewBoughtItems(JSON.parse(Response), "Your Purchases");
            }
        });
        let SettingsB = createElement("SettingsB", "div", ViewAccountFrame, {
            "box-sizing": "border-box",
            "width": "100%",
            "padding": "6px",
            "cursor": "pointer",
            "font-size": "16px",
            "line-height": "20px",
            "font-family": Font,
            "font-weight": "700",
            "color": "#000000",
            "text-align": "center",
            "overflow-wrap": "anywhere"
        });
        SettingsB.textContent = "Manage Account";
        SettingsB.addEventListener("click", async function() {
            ViewAccountFrame.remove();
            OpenModal = "";
            window.open("https://exotek.co/account?userid=" + AccountID, location.host + "_settings", "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=1000, height=650, top=" + ((screen.height / 2) - 425) + ", left=" + ((screen.width / 2) - 500));
        });
        let SignOutB = createElement("SignOutB", "div", ViewAccountFrame, {
            "box-sizing": "border-box",
            "width": "100%",
            "padding": "6px",
            "cursor": "pointer",
            "border-width": "2px 0px 0px 0px",
            "border-style": "solid",
            "border-color": "#cccccc",
            "font-size": "16px",
            "line-height": "20px",
            "font-family": Font,
            "font-weight": "700",
            "color": "#000000",
            "text-align": "center",
            "overflow-wrap": "anywhere"
        });
        SignOutB.textContent = "Sign Out";
        SignOutB.addEventListener("mouseup", async function() {
            let Token = getLocalStore("Token");
            if (Token == null) {
                return;
            }
            let[Status] = await SendRequest("PUT", "logout", JSON.stringify({
                refresh: JSON.parse(Token).Refresh
            }));
            if (Status == 200) {
                localStorage.removeItem("UserID");
                localStorage.removeItem("Token");
                location.reload();
            }
        });
    }
}
function ViewCart() {
    if (LoggedInEmail == "") {
        ShopSignInUp();
    }
    let TopBarModal = find("TopBarModal");
    if (TopBarModal != null) {
        TopBarModal.remove();
    }
    if (OpenModal == "ViewCart") {
        OpenModal = "";
        return;
    }
    OpenModal = "ViewCart";
    URLParams("asset");
    let CartViewFrame = createElement("TopBarModal", "div", PageTopBar, {
        "position": "absolute",
        "width": "100%",
        "max-width": "300px",
        "max-height": "calc(100vh - 100%)",
        "right": "0px",
        "top": "100%",
        "overflow": "auto",
        "background-color": "#ffffff",
        "border-bottom-left-radius": "12px",
        "border-bottom-right-radius": "12px",
        "backdrop-filter": "blur(12px)",
        "-webkit-backdrop-filter": "blur(12px)",
        "box-shadow": "0 6px 20px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.1)"
    });
    createElement("ViewCartTitle", "div", CartViewFrame, {
        "box-sizing": "border-box",
        "width": "100%",
        "padding": "8px 8px 0px 8px",
        "font-size": "26px",
        "line-height": "32px",
        "font-family": Font,
        "font-weight": "800",
        "color": "#000000",
        "text-align": "center",
        "overflow-wrap": "anywhere"
    }).textContent = "Your Cart";
    let TotalCost = 0;
    let TotalOffsaleItems = 0;
    let ShoppingCartKeys = Object.keys(ShoppingCart);
    for (let i = 0; i < ShoppingCartKeys.length; i++) {
        let Item = ShoppingCart[ShoppingCartKeys[i]];
        let CheckoutTile = createElement("CheckoutTile", "a", CartViewFrame, {
            "position": "relative",
            "box-sizing": "border-box",
            "display": "flex",
            "margin": "8px",
            "padding": "6px",
            "background-color": "rgba(246, 246, 246)",
            "border-radius": "12px",
            "overflow": "hidden",
            "align-items": "center",
            "cursor": "pointer"
        });
        CheckoutTile.setAttribute("ItemID", Item._id);
        createElement("CheckoutTileThumbImage", "div", CheckoutTile, {
            "width": "30px",
            "height": "30px",
            "object-fit": "cover",
            "border-radius": "6px",
            "content": "url(" + AssetURL + "images/" + Item._id + "_Image0)"
        });
        createElement("CheckoutItemName", "div", CheckoutTile, {
            "margin-left": "4px",
            "font-size": "20px",
            "line-height": "20px",
            "font-family": Font,
            "font-weight": "800",
            "color": "#000000",
            "white-space": "pre"
        }).textContent = Item.Name;
        let Price = "Offsale";
        let ColorSet = "#969696"
        if (Item.OnSale != false) {
            ColorSet = "#12E497"
            Price = Item.Price || 0;
            TotalCost += Price;
            if (Price == 0) {
                Price = "FREE";
            } else {
                let value = Number(Price);
                let res = String(Price).split(".");
                if (res.length == 1 || res[1].length < 3) {
                    value = value.toFixed(2);
                }
                Price = "$" + value;
            }
        } else {
            TotalOffsaleItems += 1;
        }
        createElement("CheckoutItemPrice", "div", CheckoutTile, {
            "position": "absolute",
            "display": "flex",
            "height": "100%",
            "right": "0px",
            "padding-right": "6px",
            "background-color": "rgb(246, 246, 246)",
            "box-shadow": "-5px 1px 5px 1px rgb(246, 246, 246)",
            "font-size": "17px",
            "line-height": "20px",
            "font-family": Font,
            "font-weight": "600",
            "color": ColorSet,
            "align-items": "center"
        }).textContent = Price;
        CheckoutTile.setAttribute("onmouseup", "OpenItemView(this.getAttribute('ItemID'))");
    }
    if (ShoppingCartKeys.length > 0) {
        if (TotalOffsaleItems < ShoppingCartKeys.length) {
            if (TotalCost > 0) {
                let value = Number(TotalCost);
                let res = String(TotalCost).split(".");
                if (res.length == 1 || res[1].length < 3) {
                    value = value.toFixed(2);
                }
                TotalCost = "$" + value;
            } else {
                TotalCost = "$0.00 (FREE)";
            }
            createElement("TotalCost", "div", CartViewFrame, {
                "box-sizing": "border-box",
                "width": "100%",
                "padding": "1px 8px 1px 8px",
                "font-size": "16px",
                "line-height": "22px",
                "font-family": Font,
                "font-weight": "600",
                "color": "#000000",
                "text-align": "center",
                "overflow-wrap": "anywhere"
            }).textContent = "Total - " + TotalCost;
            let CheckoutB = createElement("CheckoutB", "div", CartViewFrame, {
                "box-sizing": "border-box",
                "width": "calc(100% - 16px)",
                "margin": "8px",
                "padding": "6px",
                "background-image": "linear-gradient(315deg, #63a4ff 0%, #83eaf1 74%)",
                "border-radius": "6px",
                "cursor": "pointer",
                "font-size": "20px",
                "line-height": "20px",
                "font-family": Font,
                "font-weight": "900",
                "color": "#ffffff",
                "text-align": "center"
            });
            CheckoutB.textContent = "Checkout";
            CheckoutB.addEventListener("mousedown", async function() {
                let newWin = null;
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) == true) {
                    newWin = window.open("https://exotek.co", "_blank");
                }
                let[Status,Response] = await SendRequest("GET", "checkout");
                if (Status == 200) {
                    if (newWin == null) {
                        let left = (screen.width / 2) - (500 / 2);
                        let top = (screen.height / 2) - (750 / 2) - 50;
                        window.open(Response, "Checkout", "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=500, height=750, top=" + top + ", left=" + left);
                    } else {
                        newWin.location = Response;
                    }
                }
            });
        }
    } else {
        createElement("EmptyCart", "div", CartViewFrame, {
            "box-sizing": "border-box",
            "width": "100%",
            "padding": "8px 8px 8px 8px",
            "font-size": "16px",
            "line-height": "22px",
            "font-family": Font,
            "font-weight": "600",
            "color": "#bbbbbb",
            "text-align": "center",
            "overflow-wrap": "anywhere"
        }).textContent = "Your Cart is Empty...";
    }
}
CheckForAlreadySignIn();
