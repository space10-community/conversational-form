// Docs version 1.0.0
// declare module cf{
// 	
// }
// interface cf{
// 	ConversationalForm: any;
// }
// export type ConversationalForm = any;
// interface ConversationalForm = any;
// declare var ConversationalForm: any;
var ConversationalForm = (function () {
    function ConversationalForm() {
    }
    return ConversationalForm;
}());
var ConversationalFormExamples = (function () {
    function ConversationalFormExamples() {
        this.introTimer = 0;
        this.el = document.querySelector("main.content");
        var isDevelopment = document.getElementById("conversational-form-development") !== null;
        if (isDevelopment)
            this.el.classList.add("development");
        this.h1writer = new H1Writer({
            el: document.getElementById("writer")
        });
        var isMenuVisible = window.getComputedStyle(document.getElementById("small-screen-menu")).getPropertyValue("display") != "none";
        if (isMenuVisible)
            this.introFlow1();
        else
            this.introFlow2();
    }
    /**
    * @name introFlow1
    * flow for small screens
    */
    ConversationalFormExamples.prototype.introFlow1 = function () {
        var _this = this;
        var isDevelopment = document.getElementById("conversational-form-development") !== null;
        this.introTimer = setTimeout(function () {
            _this.toggleMenuState();
            _this.h1writer.start();
            _this.introTimer = setTimeout(function () {
                _this.toggleConversation();
            }, isDevelopment ? 0 : 2500);
        }, isDevelopment ? 0 : 500);
    };
    /**
    * @name introFlow2
    * flow for larger screens
    */
    ConversationalFormExamples.prototype.introFlow2 = function () {
        var _this = this;
        var isDevelopment = document.getElementById("conversational-form-development") !== null;
        this.h1writer.start();
        this.introTimer = setTimeout(function () {
            document.getElementById("info").classList.add('show');
            _this.introTimer = setTimeout(function () {
                document.getElementById("form").classList.add('show');
                document.getElementById("cf-toggle-btn").classList.add('show');
                _this.introTimer = setTimeout(function () {
                    _this.toggleConversation();
                }, isDevelopment ? 0 : 1500);
            }, isDevelopment ? 0 : 3000);
        }, isDevelopment ? 0 : 1500);
    };
    ConversationalFormExamples.prototype.toggleMenuState = function () {
        var open = this.el.classList.toggle('menu-toggle', !this.el.classList.contains('menu-toggle'));
        if (open) {
            this.el.classList.remove('cf-toggle');
        }
        return false;
    };
    ConversationalFormExamples.prototype.toggleConversation = function () {
        var _this = this;
        clearTimeout(this.introTimer);
        if (!this.el.classList.contains('cf-toggle')) {
            setTimeout(function () {
                _this.el.classList.remove('menu-toggle');
                _this.el.classList.add('cf-toggle');
            }, 10);
        }
        else {
            this.el.classList.remove('cf-toggle');
        }
        return false;
    };
    ConversationalFormExamples.start = function () {
        if (!ConversationalFormExamples.instance)
            window.conversationalFormExamples = new ConversationalFormExamples();
    };
    return ConversationalFormExamples;
}());
var H1Writer = (function () {
    function H1Writer(options) {
        this.progress = 0;
        this.progressTarget = 0;
        this.str = "";
        this.strs = ["...", "TBD"];
        this.step = 0;
        this.el = options.el;
        this.strs[1] = this.el.innerHTML;
        this.el.innerHTML = "";
        this.el.classList.add("show");
    }
    H1Writer.prototype.start = function () {
        this.progress = 0;
        this.progressTarget = 1;
        this.str = this.strs[this.step];
        this.render();
    };
    H1Writer.prototype.nextStep = function () {
        if (this.progressTarget == 0) {
            this.step++;
        }
        this.str = this.strs[this.step];
        this.progressTarget = this.progressTarget == 0 ? 1 : 0;
        this.render();
    };
    H1Writer.prototype.render = function () {
        var _this = this;
        this.progress += (this.progressTarget - this.progress) * (this.step == 0 ? 0.15 : 0.09);
        var out = this.str.substr(0, Math.round(this.progress * this.str.length));
        this.el.innerHTML = out;
        if (Math.abs(this.progress - this.progressTarget) <= 0.01) {
            cancelAnimationFrame(this.rAF);
            if (this.step < 1) {
                setTimeout(function () {
                    _this.nextStep();
                }, 500);
            }
        }
        else
            this.rAF = window.requestAnimationFrame(function () { return _this.render(); });
    };
    return H1Writer;
}());
if (document.readyState == "complete") {
    // if document alread instantiated, usually this happens if Conversational Form is injected through JS
    ConversationalFormExamples.start();
}
else {
    // await for when document is ready
    window.addEventListener("load", function () {
        ConversationalFormExamples.start();
    }, false);
}
