import { useState, useEffect } from 'react';
import { ToDoItem } from './to-do.types'
import { ToDoService } from './to-do.api'
import * as cs from '@cloudscape-design/components'
import { useCollection } from '@cloudscape-design/collection-hooks';
import "@cloudscape-design/global-styles/index.css"

const SERVICE = new ToDoService();

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<ToDoItem[]>(new Array<ToDoItem>())
  const [selectedItem, setSelectedItem] = useState<ToDoItem>({id: "",title:""})
  const [ editing, setEditing ] = useState(false)
  const [title, setTitle] = useState(selectedItem.title)
  const [description, setDescription] = useState(selectedItem.description)
  const [ modalOpen, setModalOpen ] = useState(false)
  const [ changing, setChanging ] = useState(false)
  const AppProps = {
    loading,
    items
  }
  useEffect(() => {
   SERVICE.Read().then(i => {
     setItems(i)
     setLoading(false)
     });
   }, []);

  async function handleChange(i:ToDoItem) {
    if (editing) {
      update(i)
    } else {
      await SERVICE.Create(i)
      setItems((currItems) => currItems.concat(i))
    }
    reset()
  }
  async function update(i:ToDoItem) {
    await SERVICE.Update(i)
    setItems((currItems) => currItems.map(x=>(x.id===i.id ? i: x)))
  }

  async function submit() {
    if (changing) return;
    setChanging(true)
    let i = {...selectedItem, title, description};
    try {
      await handleChange(i);
    } catch (err) {
      console.error(err)
    }
    setChanging(false)
  }

  async function toggleComplete(i:ToDoItem) {
    if (changing) return;
    setChanging(true)
    try {
      await update({...i, completed: !i.completed })
    } catch (err) {
      console.error(err)
    }
    setChanging(false)
  }
  function reset() {
    setTitle("")
    setDescription("")
    setSelectedItem({title:""} as ToDoItem)
    setEditing(false)
    setModalOpen(false)
  }

  function edit(i:ToDoItem) {
    setTitle(i.title)
    setDescription(i.description)
    setSelectedItem(i)
    setEditing(true)
    setModalOpen(true)
  }

  const CARD_DEFINITIONS:cs.CardsProps.CardDefinition<ToDoItem> =
  {
    header: item => (
      <div onClick={()=>edit(item)}>
        <cs.Link fontSize="heading-m" href="#" >
          {item.title}
        </cs.Link>
      </div>
    ),
    sections: [
      {
        id: 'description',
        content: item => item.description,
      },
      {
        id: 'completed',
        content: item => item.completed ? (
          <cs.StatusIndicator colorOverride="blue">Completed</cs.StatusIndicator>
        ) : (
          <cs.Button iconName="status-positive" onClick={()=>toggleComplete(item)}>Mark as complete</cs.Button>
        )
      }
    ],
  };

  function ToDoCards(props:any){
     const { items, collectionProps, filterProps } = useCollection(props.items, {
       selection: {
         trackBy: (i:ToDoItem) => i.id
       }
     })
      return (
        <cs.Cards
          {...collectionProps}
          loading={props.loading}
          cardDefinition={ CARD_DEFINITIONS }
          variant="full-page"
          selectionType="single"
          items={items}
          filter={
            <cs.TextFilter
              {...filterProps}
              filteringAriaLabel="Filter items"
              filteringPlaceholder="Find items"
              disabled={loading}
            />
          }
          onSelectionChange={({ detail })=>edit(detail.selectedItems[0])}
        />
      )
    }
  return (
    <cs.AppLayout
      content={<ToDoCards {...AppProps}/>}
      contentType="cards"
      contentHeader={
        <cs.Header
          variant="h1"
          actions={
            <cs.SpaceBetween direction="horizontal" size="l">
              <cs.Button id="create-new-button" variant="primary" onClick={()=>setModalOpen(true)}>Create New</cs.Button>
            </cs.SpaceBetween>
          }
        >
          To-Do List
          <cs.Modal
            id="edit-modal"
            onDismiss={()=>setModalOpen(false)}
            visible={modalOpen}
            closeAriaLabel="Close modal"
            footer={
              <cs.Box float="right">
                <cs.SpaceBetween direction="horizontal" size="xs">
                  <cs.Button id="cancel-button" variant="link"  disabled={changing} onClick={reset}>Cancel</cs.Button>
                  <cs.Button id="submit-button" variant="primary" disabled={changing} onClick={submit}>Ok</cs.Button>
                </cs.SpaceBetween>
              </cs.Box>
            }
            header="Add To-Do Item"
          >
          <form onSubmit={event => event.preventDefault()}>
          <cs.Form>
          <cs.FormField label="Name">
            <cs.Input
              value={title}
              onChange={event => setTitle(event.detail.value)}
            />
          </cs.FormField>
          <cs.FormField label="Description">
            <cs.Textarea
              value={description || ""}
              onChange={event => setDescription(event.detail.value)}
            />
          </cs.FormField>
          </cs.Form>
          </form>
          </cs.Modal>
         </cs.Header>
      }
      navigationHide={true}
      toolsHide={true}
      stickyNotifications={true}
    />
  );
}

export default App;
