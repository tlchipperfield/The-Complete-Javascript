import Search from './models/Search'
import Recipe from './models/Recipe'
import List from './models/List'
import Likes from './models/Likes'
import * as searchView from './views/searchView'
import * as recipeView from './views/recipeView'
import * as listView from './views/listView'
import * as likesView from './views/likesView'
import { elements, renderLoader, clearLoader } from './views/base'
// Global State of the app
// - Search object
// - Current recipe object
// - Shopping list object
// - Liked recipes
//

const state = {}
window.state = state

/******
 * SEACH CONTROLLER
 */

const constrolSearch = async () => {
  // 1) get the query
  const query = searchView.getInput()

  if (query) {
    // 2) new search object and add to state
    state.search = new Search(query)

    // 3) Prepare UI for results
    searchView.clearInput()
    searchView.clearResults()
    renderLoader(elements.searchRes)

    try {
      // 4) Search for recipes
      await state.search.getResults()

      // 5) render results on UI
      clearLoader()
      searchView.renderResults(state.search.result)
    } catch (err) {
      alert('Something wrong with the search')
      clearLoader()
    }
  }
}

elements.searchForm.addEventListener('submit', (e) => {
  e.preventDefault()
  constrolSearch()
})

elements.searchResPages.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-inline')
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10)
    searchView.clearResults()
    searchView.renderResults(state.search.result, goToPage)
    console.log(goToPage)
  }
})

/******
 * RECIPE CONTROLLER
 */
const controlRecipe = async () => {
  // get id from url
  const id = window.location.hash.replace('#', '')

  if (id) {
    //prepare ui for changes
    recipeView.clearRecipe()
    renderLoader(elements.recipe)

    // Highlight selected search item
    if (state.search) searchView.highlightSelected(id)

    // create new recipe object
    state.recipe = new Recipe(id)

    try {
      // get recipe data
      await state.recipe.getRecipe()
      state.recipe.parseIngredients()
      // // calculate servings and time
      state.recipe.calcTime()
      state.recipe.calcServings()
      // // render recipe
      clearLoader()
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id))
    } catch (err) {
      alert('Error processing recipe!')
    }
  }
}
//  window.addEventListener('hashchange', controlRecipe);
//  window.addEventListener('load', controlRecipe);
;['hashchange', 'load'].forEach((event) =>
  window.addEventListener(event, controlRecipe),
)

/****
 * LIST CONTROLLER
 */
const controlList = () => {
  // 1. Create a new list if there is none yet
  if (!state.list) state.list = new List()

  // 2. Add each ingredients to the list and UI
  state.recipe.ingredients.forEach((el) => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient)
    listView.renderItem(item)
  })
}

// Handle delete and update list item events
elements.shopping.addEventListener('click', (e) => {
  const id = e.target.closest('.shopping__item').dataset.itemid

  // handle the delete btn
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    // delete from state
    state.list.deleteItem(id)

    // delete from UI
    listView.deleteItem(id)

    // Handle the count update
  } else if (e.target.matches('.shopping__coount-value')) {
    const val = praseFloat(e.target.value)
    state.list.updateCount(id, val)
  }
})

/**
 * LIKE CONTROLLER
 */

const controlLike = () => {
  if (!state.likes) state.likes = new Likes()
  const currentID = state.recipe.id

  // User has not liked current recipe
  if (!state.likes.isLiked(currentID)) {
    // Add like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img,
    )
    // Toggle the like button
    likesView.toggleLikeBtn(true)
    // Add like to UI list
    likesView.renderLike(newLike)

    // User has liked the current recipe
  } else {
    // Remove like from the state
    state.likes.deleteLike(currentID)
    // Toggle the like button
    likesView.toggleLikeBtn(false)
    // Remove like from UI list
    likesView.deleteLike(currentID)
  }
  likesView.toggleLikesMenu(state.likes.getNumLikes())
}

// Restore like recipes on page load
window.addEventListener('load', () => {
  state.likes = new Likes()
  // Restore Likes
  state.likes.readStorage()

  // Toggle like menu button
  likesView.toggleLikesMenu(state.likes.getNumLikes())

  // Render the existings likes
  state.likes.likes.forEach((like) => likesView.renderLike(like))
})

// Handling recipe button clicks
elements.recipe.addEventListener('click', (e) => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    //Decrease button click
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec')
      recipeView.updateServingsIngredients(state.recipe)
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    // increase button clicked
    state.recipe.updateServings('inc')
    recipeView.updateServingsIngredients(state.recipe)
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    controlList()
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    // Like controller
    controlLike()
  }
})

window.l = new List()
