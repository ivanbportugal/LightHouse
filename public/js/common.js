$(document).ready(function() {

	setMenuActive();
});

function setMenuActive() {
    var currPage = getCurrentPageName();

    // Highlight menu buttons
    switch (currPage) {
        case '':
            $('li.homeMenu').addClass('active');
            break;
        case 'chat':
            $('li.chatMenu').addClass('active');
            break;
        case 'tracker':
            $('li.trackerMenu').addClass('active');
            break;
        case 'files':
            $('li.uploadsMenu').addClass('active');
            break;
    }
}

function getCurrentPageName() {
    //method to get Current page name from url. 
    var PageURL = document.location.href;
    var PageName = PageURL.substring(PageURL.lastIndexOf('/') + 1); 

    var pageName = PageName.toLowerCase();

    if(pageName.indexOf("#") >= 0){
        pageName = pageName.substring(pageName.lastIndexOf('#') + 1);
    }
 
    return pageName;
}