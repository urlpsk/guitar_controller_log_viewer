const isDebug = false;
const vm = Vue.createApp({
    data() {
        return {
            settings: {
                buttons: ['4', '3', '2', '1', '0'],
                colors: ['rgba(255,255,255,1)', 'rgba(255,192,192,1)', 'rgba(192,192,192,1)', 'rgba(192,255,192,1)', 'rgba(128,128,128,1)'],
                picks: ['11', '12'],
                frameHeight: 7,
                laneHeight: 500,
                reverse: false,
                transparent: 1,
            },
            frameItems: [],
            beforePick: '',
            url: '',
        }
    },
    methods: {
        init: function () {
            this.setSettingsFromUrl();
            this.itemReset();
            this.updateColor();
            let previousActivePick = '';
            (function loop() {
                const gamePad = navigator.getGamepads()[0];
                if (!gamePad || vm.isAnyButtonSettingInvalid()) {
                    requestAnimationFrame(loop);
                    return;
                }

                const frameData = [];

                //button
                let isOpen = true;
                for (const buttonName in vm.buttonMap) {
                    const isPressed = gamePad.buttons[vm.buttonMap[buttonName]].pressed;
                    frameData.push(isPressed);
                    if (isPressed) {
                        isOpen = false;
                    }
                }
                frameData.push(isOpen);

                //pick
                let anyPicked = false;
                let isContinuousSamePick = false;
                for (const pickName in vm.pickMap) {
                    const isPressed = gamePad.buttons[vm.pickMap[pickName]].pressed;
                    const isSamePick = vm.beforePick === pickName;
                    const isPickActive = isPressed && !isSamePick;
                    frameData.push(isPickActive);
                    if (isPickActive) {
                        if (previousActivePick === pickName) {
                            isContinuousSamePick = true;
                        }
                        previousActivePick = pickName;
                    }
                    if (isPressed) {
                        vm.beforePick = pickName;
                        anyPicked = true;
                    }
                }
                // continuousSamePick
                frameData.push(isContinuousSamePick);
                // pickEmpty
                frameData.push(!anyPicked && vm.beforePick !== "");
                if (!anyPicked) {
                    vm.beforePick = "";
                }

                if (vm.settings.reverse) {
                    vm.frameItems.unshift(frameData);
                    vm.frameItems.pop();
                } else {
                    vm.frameItems.push(frameData);
                    vm.frameItems.shift();
                }

                requestAnimationFrame(loop);
            }());
        },
        itemReset: function () {
            if (isDebug) {
                vm.frameItems = vm.getDummyFrameItems();
            } else {
                vm.frameItems = Array.from(Array(vm.frameNumber), () => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            }
            this.displayUrl();
        },
        inputPreset: function (presets) {
            vm.settings.buttons = presets.slice(0, -2);
            vm.settings.picks = presets.slice(-2);
            this.displayUrl();
        },
        setSettingsFromUrl: function () {
            const url = new URL(window.location);
            const params = new URLSearchParams(url.search);
            for (const [k, v] of params) {
                switch (k) {
                    case 's':
                        vm.settings.frameHeight = v;
                        break;
                    case 'r':
                        vm.settings.reverse = v == 1;
                        break;
                    case 'h':
                        vm.settings.laneHeight = v;
                        break;
                    case 't' :
                        vm.settings.transparent = v;
                        break;
                    case 'b':
                        vm.settings.buttons = v.split(',');
                        break;
                    case 'p':
                        vm.settings.picks = v.split(',');
                        break;
                    case 'c':
                        vm.settings.colors = v.split('|');
                        break;
                }
            }
        },
        displayUrl: function () {
            const params = [
                's=' + vm.settings.frameHeight,
                'r=' + (vm.settings.reverse ? 1 : 0),
                'h=' + vm.settings.laneHeight,
                't=' + vm.settings.transparent,
                'b=' + vm.settings.buttons.join(','),
                'p=' + vm.settings.picks.join(','),
                'c=' + vm.settings.colors.join('|'),
            ];
            //GETパラメータを除外して追加
            vm.url = window.location.toString().replace(window.location.search, '') + '?' + params.join('&');
            history.replaceState(null, null, vm.url);
        },
        isAnyButtonSettingInvalid: function () {
            return [...vm.settings.buttons, ...vm.settings.picks]
                .filter(item => {
                    return !/^\d+$/.test(item);
                }).length > 0;
        },
        getDummyFrameItems() {
            //rgbyp, open, up, down, continuousPick, pickEmpty
            return [
                [1,1,1,1,1,0,1,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,1,0,1,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [1,1,1,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,1,0,0],
                [1,0,0,0,0,0,0,0,0,1],
                [1,1,0,0,0,0,0,0,0,0],
                [1,1,0,0,0,0,1,0,0,0],
                [1,1,0,0,0,0,0,0,0,1],
                [1,0,1,0,0,0,0,0,0,0],
                [1,0,1,0,0,0,0,1,0,0],
                [1,0,1,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,1,1,0],
                [1,0,0,0,0,0,0,0,0,1],
                [1,1,0,0,0,0,0,0,0,0],
                [1,1,0,0,0,0,0,1,1,0],
                [1,1,0,0,0,0,0,0,0,1],
                [0,0,0,1,0,0,0,0,0,0],
                [0,0,0,1,0,0,1,0,0,0],
                [0,0,0,1,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,1,0,0],
                [1,0,0,0,0,0,0,0,0,1],
                [1,1,0,0,0,0,0,0,0,0],
                [1,1,0,0,0,0,1,0,0,0],
                [1,1,0,0,0,0,0,0,0,1],
                [1,0,1,0,0,0,0,0,0,0],
                [1,0,1,0,0,0,0,1,0,0],
                [1,0,1,0,0,0,0,0,0,1],
                [0,1,0,0,0,0,0,0,0,0],
                [0,1,0,0,0,0,1,0,0,0],
                [0,1,0,0,0,0,0,0,0,1],
                [1,0,0,0,0,0,0,0,0,0],
                [1,0,0,0,0,0,0,1,0,0],
                [1,0,0,0,0,0,0,0,0,1],
            ];
        },
        updateColor: function () {
            const stylesheet = document.styleSheets[1];
            this.settings.colors.forEach(function (value, index) {
                stylesheet.cssRules[index].style['background-color'] = value;
            });
            this.displayUrl();
        },
    },
    computed: {
        frameNumber: function () {
            return Math.ceil(parseFloat(this.settings.laneHeight) / this.settings.frameHeight);
        },
        buttonMap: function () {
            return {
                'red': this.settings.buttons[0],
                'green': this.settings.buttons[1],
                'blue': this.settings.buttons[2],
                'yellow': this.settings.buttons[3],
                'purple': this.settings.buttons[4],
            };
        },
        pickMap: function () {
            return {
                'up_pick': this.settings.picks[0],
                'down_pick': this.settings.picks[1],
            };
        },
        laneWidth: function () {
            return 245;
        },
        lifetime: function () {
            return Math.round(1000.0 / 60 * this.frameNumber);
        },
        laneBackgroundColor: function () {
            return 'rgba(0,0,0,' + (100 - this.settings.transparent) * 0.01 + ')';
        },
        css: function () {
            return 'body{ background-color: transparent; overflow: hidden;}';
        },
    },
}).mount('#app');

vm.init();