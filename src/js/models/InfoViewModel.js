var fs = require('fs');
var ko = require('knockout');

var infoHTML = fs.readFileSync(__dirname + '/../templates/info.html', 'utf8');

function InfoViewModel() {
    console.log('new infoviewmodel')

    this.infoText = ko.observable('Show Info');
    window.addEventListener("hashchange", this.hashChange.bind(this));
    this.hashChange();
}

InfoViewModel.prototype.applyBindings = function() {
    var div = document.querySelector("#content-wrapper");
    var inner = div.querySelector('.inner');

    if (inner) {
        ko.cleanNode(inner);
        inner.remove();
    }
    div.innerHTML = infoHTML;
    inner = div.querySelector('.inner');
    ko.applyBindings(this, inner);
};

InfoViewModel.prototype.hashChange = function() {
    if (location.hash === '#/info') {
        this.applyBindings();
        this.infoText('Hide Info');
    }
};

InfoViewModel.prototype.toggleInfo = function() {
    if (location.hash === '#/info') {
        this.infoVM.infoText('Show Info');
        if (history.length > 2)
            history.back();
        else
            location = '#';
    }
    else {
        this.infoVM.infoText('Hide Info');
        return true;
    }
}

InfoViewModel.prototype.reportProblem = function() {
    window.location.href = "mailto:ldawoodjee@gmail.com?subject=MetroRappid Issue&body=Issue:%0ADescription:%0ASteps To Reproduce:";
    setTimeout(function() {
        window.location.href = "https://www.youtube.com/watch?v=ygr5AHufBN4";
    }, 3000);
};

module.exports = InfoViewModel;
