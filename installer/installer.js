(() => {
    if (!!window.UpdateStartMenuState)
        return $alert("HAMPSTER7 is already installed!!!")
    if (!window.UpdateStartMenuState)
    (async () => {
        $notif("Please wait. The HAMPSTER7 installer files are being retrieved from the archive...");
        var Files = [
            "7.css",
            "7.js",
            "assets/profile.png",
            "assets/reflection.png",
            "assets/start_1.png",
            "assets/start_2.png",
            "assets/volume.png",
            "assets/ethernet.png",
            "installer/installer.html",
        ]; var FileIndex = 0; var SavedFiles = {}; var SavedFilesURLs = {};
        localStorage[".config/seven-dock-items"] = JSON.stringify(["dmg", "catex", "dosbox", "flash", "hampster", "nes", "virtualpc", "trollbox", "terminal", "code"])
        for (var i = 9; 44 > i; i++)
            Files.push(`tiles/usertile${i}.bmp`)
        var DownloadNext = async () => {
            if (Files[FileIndex]) {
                fetch(`https://raw.githubusercontent.com/raymonable/hamster7/main/${Files[FileIndex]}`).then(_ => _.blob()).then(BlobData => {
                    SavedFiles[Files[FileIndex]] = BlobData
                    FileIndex += 1;
                    DownloadNext();
                });
            } else {
                // Patch document
                var Document = new DOMParser().parseFromString(await SavedFiles["installer/installer.html"].text(), "text/html");
                Object.keys(SavedFiles).forEach(FilePath => {
                    SavedFilesURLs[FilePath] = URL.createObjectURL(SavedFiles[FilePath]);
                })
                var InjectedScript = Document.createElement("script");
                InjectedScript.textContent = `window.Assets = JSON.parse(\`${JSON.stringify(SavedFilesURLs)}\`)`;
                Document.head.appendChild(InjectedScript);
    
                window.SevenInstaller = $window({
                    url: URL.createObjectURL(new Blob([Document.documentElement.innerHTML], {type: "text/html"})),
                    title: "HAMSTER7 installer",
                    icon: "/c/programs/hampsterDance/icon.gif",
                    width: 600,
                    height: 350
                })
            }
        }; DownloadNext();
        window.addEventListener("message", async (e) => {
            try {
                var data = JSON.parse(e.data);
                if (data.name) {
                    // Yes, it's our data
                    window.SevenInstaller.close();
                    window.location.hash = "";
                    localStorage[".config/7/name"] = data.name;
                    localStorage["boot/7.js"] = await SavedFiles["7.js"].text();
                    localforage.setItem(`.config/7/7.css`, SavedFiles[`7.css`]);
    
                    (["volume.png", "ethernet.png", "reflection.png", "start_1.png", "start_2.png"]).forEach(asset => {
                        localforage.setItem(`.config/7/${asset}`, SavedFiles[`assets/${asset}`]);
                    });
                    
                    // Let's create the user tile icon
                    var iconCanvas = document.createElement("canvas");
                    var iconContext = iconCanvas.getContext("2d");
                    iconCanvas.width = 64;
                    iconCanvas.height = 64;
                    
                    var containerImage = new Image();
                    containerImage.src = SavedFilesURLs["assets/profile.png"];
                    containerImage.onload = () => {
                        var tileImage = new Image();
                        switch (data.tile.type) {
                            case "regular":
                                tileImage.src = SavedFilesURLs[`tiles/${data.tile.file}`];
                                break;
                            case "file":
                                // TODO
                                break;
                        }
                        tileImage.onload = async () => {
                            iconContext.drawImage(tileImage, 0, 0, tileImage.width, tileImage.height, 8, 8, 48, 48);
                            iconContext.drawImage(containerImage, 0, 0);
                            iconCanvas.toBlob((blob) => {
                                localforage.setItem(`.config/7/usertile`, blob);
                                setTimeout(() => {
                                    $exe("reboot")
                                }, 200);
                            })
                        };
                    };
                }
            } catch(err) {console.log(err)};
        })
    })();
})();
