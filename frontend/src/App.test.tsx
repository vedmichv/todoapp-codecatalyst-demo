import { render, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import App from './App';
import wrapper from '@cloudscape-design/components/test-utils/dom';
import { ModalWrapper, CardsWrapper, ElementWrapper } from '@cloudscape-design/components/test-utils/dom'
import { ToDoService } from './to-do.api';
import { ToDoItem } from './to-do.types'

let app:Element
let mockDB:ToDoItem[] = [
  { id: "23", title: "Go Shopping", description: "lettuce, avocados, olive oil", completed:false },
  { id: "34", title: "Exercise", description: "45 min HIIT", completed: false}
];

jest.mock('./to-do.api', () => {
  return {
    ToDoService: jest.fn<ToDoService,any[]>(() => { return {
        Read: async () => { return mockDB },
        Create: async (i:ToDoItem) => {
          mockDB = mockDB.concat(i);
          return i
        },
        Update: async (i:ToDoItem) => {
          mockDB = mockDB.map(x=>(x.id===i.id ? i: x))
          return i
        }
      } as ToDoService
    } )} } )

jest.mocked(ToDoService, true);

async function fillForm(editForm:ModalWrapper) {
  let ok = editForm!.findFooter()!.findButton("#cancel-button")
  let nameF = editForm!.findContent().findInput();
  let descF = editForm!.findContent().findTextarea();
  await act(async () => {
    nameF!.setInputValue("<script>name</script>")
    descF!.setTextareaValue("<script>Description</script>")
    ok!.click();
  })
}

beforeEach(async () => {
  await act(async () => {
    app = render(<App />).baseElement
  })
})

describe('test create new item', () => {

  let editForm:ModalWrapper|null

  beforeEach(async () => {
    const a = wrapper(app);
    const trigger = a.findButton("#create-new-button");
    await act(async () => trigger!.click())
    editForm = a.findModal("#edit-modal")
  })

  test('create new buttons works', async () => {
    await waitFor(()=>expect(editForm!.isVisible()).toEqual(true));
  })
  test('dismiss button works', async()=>{
    await act(async ()=>editForm!.findDismissButton().click())
    await waitFor(() =>expect(editForm!.isVisible()).toEqual(false))
  })
  test('cancel button works',async()=>{
    let cancel = editForm!.findFooter()!.findButton("#cancel-button")
    await act(async ()=>cancel!.click())
    await waitFor(() =>expect(editForm!.isVisible()).toEqual(false))
  })
  test('submit button works', async () => {
    await fillForm(editForm!)
    // assert new card
  })
  describe('cards section', ()=> {
    let card_section:CardsWrapper|null;
    let wrapApp:ElementWrapper<Element>;
    beforeEach(()=> {
      wrapApp = wrapper(app);
      card_section = wrapApp.findCards()
    })
    it('should load', async ()=>{
      let c = card_section!.findItems();
      await waitFor(() =>expect(c.length).toEqual(2))
      await act(async ()=>{c[0]!.findCardHeader()!.click()})
      editForm = wrapApp.findModal("#edit-modal")
      await waitFor(() =>expect(editForm!.isVisible()).toEqual(true))
      await fillForm(editForm!)
      c = card_section!.findItems();
      await waitFor(() =>expect(c.length).toEqual(2))
    })
  })
})
