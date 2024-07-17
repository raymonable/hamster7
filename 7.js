if (!window.$_window) {
  let $_window = $window;
  window.$_window = $_window;
}
var RepairWindow = (Window) => {
    // Generate window
	var WindowBody = Window.el.base;

	// Add glass class
	WindowBody.classList.add("glass")

	// Fix menus
	WindowBody.querySelectorAll(".ui_menu").forEach(MenuContainer => {
		var Menu = MenuContainer.querySelector("ul");
		Menu.setAttribute("role", "menubar")
	})

	// Move buttons into the proper container
	var ButtonContainer = document.createElement("div");
	ButtonContainer.classList.add("ui_window__head__controls");
	WindowBody.querySelector(".ui_window__head").appendChild(ButtonContainer);
	WindowBody.querySelector(".ui_window__head").querySelectorAll("button").forEach(Button => {
		ButtonContainer.appendChild(Button)
	})
    return Window;
}
window.$window = (ref, data) => {
	// Fill in icon
	if (data != null) {
		if (!(data.icon != null))
			data.icon = "/c/sys/skins/w93/question.png"
	} else if (typeof ref == "string") {
		const url = ref;
		ref = {
			url,
            title: url,
			icon: "/c/sys/skins/w93/question.png"
		}
	} else
		if (!(ref.icon != null))
			ref.icon = "/c/sys/skins/w93/question.png"

	return RepairWindow($_window(ref, data));
};

function prototype() { }
prototype.call = (ref, data) => {
    if (ref)
        if (ref.arg)
            if (ref.arg.command)
                if (le._apps[ref.arg.command]) {
                    var dockItems = JSON.parse(localStorage[".config/seven-dock-items"]);
                    dockItems = dockItems.filter(i => i !== ref.arg.command);
                    dockItems.push(ref.arg.command);
                    if (dockItems.length > 10)
                        while (dockItems.length > 10)
                            dockItems.shift();
                    localStorage[".config/seven-dock-items"] = JSON.stringify(dockItems);
                }
    return RepairWindow($_window.call(ref, data));
}
Object.setPrototypeOf($window, prototype);

var GetFileURL = (Path, Mime) => {
	return new Promise(async Resolve => {
		var b = await localforage.getItem(Path);
		if (!b)
			return Resolve(``);
        if (Mime) {
            const NonMimedBlob = b;
            b = new Blob([await NonMimedBlob.text()], {type: Mime});
        }
		var BlobURL = URL.createObjectURL(b);
		Resolve(BlobURL);
	})
}
var UpdateStartMenuState = (state) => {
    var sevenDock = document.querySelector(".seven_start_menu");
    if (sevenDock) {
        sevenDock.classList[state ? "add" : "remove"]("visible");
        
        var list = JSON.parse(localStorage[".config/seven-dock-items"]);
        sevenDock.querySelector(".ui_window__body").innerHTML = ``
        list.reverse().forEach(appName => {
            var app = le._apps[appName];
            if (app) {
                var appItem = document.createElement("button");
                appItem.classList.add("large");
                appItem.innerHTML = `<img src="${app.icon || "/c/sys/skins/w93/question.png"}"> ${app.name || appName}`;
                appItem.addEventListener("click", () => {
                    UpdateStartMenuState(false);
                    $exe(appName);
                })
                sevenDock.querySelector(".ui_window__body").appendChild(appItem);
            }
        })

        var allPrograms = document.createElement('button');
        allPrograms.classList.add("end");
        allPrograms.innerHTML = "<div></div><span>All Programs</span>"
        sevenDock.querySelector(".ui_window__body").appendChild(allPrograms);
    }
}

// Apply icons
(async() => {
	document.querySelector("#s42_start").querySelector("img").src = await GetFileURL(".config/7/start_1.png");
	document.querySelector("#s42_taskbar").style = `background-image: url(${await GetFileURL(".config/7/reflection.png")})`;
	document.querySelector("#s42_notif").innerHTML = `<div class="seven_tray"><img src="${await GetFileURL(".config/7/ethernet.png")}"><img src="${await GetFileURL(".config/7/volume.png")}"></div><div class="seven_clock">7:04 AM<br>7/11/2024</div>`

	var sevenDock = document.createElement("div");
	sevenDock.classList = "seven_start_menu glass"
	sevenDock.innerHTML = `
	<div class="ui_window__body"></div>
	<div class="seven_side_bar">
		<div class="seven_profile_container">
			<img src="${await GetFileURL(".config/7/usertile")}" class="seven_profile_image">
		</div>
	</div>`
	document.body.appendChild(sevenDock);

    ([
        {t: 1, n: localStorage[".config/7/name"], e: "crazy"},
        {t: 1, n: "Desktop", e: "/a/desktop/"},
        {t: 1, n: "Documents", e: "/c/files/documents/"},
        {t: 1, n: "Pictures", e: "/c/files/images/"},
        {t: 1, n: "Music", e: "/c/files/music/"},
        {t: 1, n: "Files", e: "/c/files/"},
        {t: 2},
        {t: 1, n: "Drive A:", e: "/a/"},
        {t: 1, n: "Drive C:", e: "/c/"},
        {t: 1, n: "Reset This PC", e: "format"},
        {t: 2},
        {t: 1, n: "Help & Support", e: "manifesto"},
        {t: 1, n: "Run", e: "terminal"},
        {t: 1, n: "Restart", e: "reboot"},
        {t: 1, n: "Shutdown", e: "shutdown"}
    ]).forEach(obj => {
        var elem = document.createElement(obj.t == 1 ? "button" : "div");
        switch (obj.t) {
            case 1: 
                elem.innerText = obj.n;
                elem.addEventListener("click", (e) => {
                    $exe(obj.e);
                    UpdateStartMenuState(false);
                })
                break;
            case 2:
                elem.classList.add("seven_divider");
        }
        sevenDock.querySelector(".seven_side_bar").appendChild(elem);
    })

    var start = document.querySelector("#s42_start");
    var newStart = start.cloneNode(true);
    start.parentNode.replaceChild(newStart, start);
    newStart.addEventListener("click", (e) => {
        UpdateStartMenuState(!sevenDock.classList.contains("visible"));
    })

    // Hide dock when clicking on the desktop
    document.body.addEventListener("mousedown", (e) => {
        if (e.target == newStart)
            return;
        if (sevenDock.classList.contains("visible")) {
            var bounds = sevenDock.getBoundingClientRect();
            if (!(bounds.x <= e.clientX && bounds.y <= e.clientY && bounds.x + bounds.width >= e.clientX && bounds.y + bounds.height >= e.clientY))
                UpdateStartMenuState(false)
        }
    })
    
    // Load stylesheet
    var Stylesheet = document.createElement("link");
    Stylesheet.href = await GetFileURL(".config/7/7.css", "text/css");
    Stylesheet.rel = "stylesheet";
    document.head.appendChild(Stylesheet);
})();

le._apps.format.exec = function() {$confirm("Are you sure to reinstall Windows93, you will loose all your saved data (including HAMSTER7...)",function(ok) {if (ok) $file.format(function() { document.location.reload(true); });});}
