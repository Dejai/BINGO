// Get the search related values
function onGetSearchValues()
{
    let placeholderFromAttribute = document.getElementById("searchBar")?.getAttribute("data-jpd-placeholder");
    let placeholderCnt = document.querySelectorAll(".searchableBlock")?.length;
    var placeholder = (placeholderCnt > 0 ) ? `Search ${placeholderCnt} Cards ...` :placeholderFromAttribute;
    let filterValue = mydoc.getContent("#searchBar")?.innerText ?? "";
    filterValue = (filterValue == "" || filterValue == placeholder) ? " " : filterValue;

    return { "Filter": filterValue, "Placeholder": placeholder }
}

// Filter the list of games
function onFilterCards()
{
    let search = onGetSearchValues();

    // Show option to clear search;
    if(search.Filter != " "){ 
        mydoc.showContent("#searchClearIcon"); 
        mydoc.addClass("#searchClearIcon", "fa");
    } 

    document.querySelectorAll(".searchableBlock")?.forEach( (item)=>{
        let titleText = item.querySelector(".cardTitle")?.innerText?.toUpperCase().replace("\n", " ");
        let searchText = search.Filter.toUpperCase().trim();
        let searchText2 = `#${searchText}`; // searching by numbered values;
        if(!titleText.includes(searchText) && !titleText.includes(searchText2)) {
            item.classList.add("hidden");
        } else {
            item.classList.remove("hidden");
        }
    });
}

// Focusing into the search bar
function onSearchFocus() {
    let search = onGetSearchValues();
    if(search.Filter == " ") {
        mydoc.setContent("#searchBar", {"innerText":""});
    }
    mydoc.addClass("#searchBar", "searchText");
    mydoc.removeClass("#searchBar", "searchPlaceholder");
}

// Blurring from the search bar
function onSearchBlur()
{
    let search = onGetSearchValues();
    if(search.Filter == " ")
    {
        mydoc.addClass("#searchBar", "searchPlaceholder");
        mydoc.removeClass("#searchBar", "searchText");
        mydoc.setContent("#searchBar", {"innerText":search.Placeholder});
        mydoc.hideContent("#searchClearIcon");
        mydoc.removeClass("#searchClearIcon", "fa");
    }        
}

// Clear the search
function onClearSearch()
{
    mydoc.setContent("#searchBar" ,{"innerText":""});
    onFilterCards();
    onSearchBlur();
}