import { ToDoServiceInterface, ToDoItem } from './to-do.types'

export class ToDoService implements ToDoServiceInterface {

  readonly url:string;

  constructor() {
    this.url=process.env.REACT_APP_SERVICE_URL || "undefined";
  }

  async Read():Promise<ToDoItem[]> {
    return new Promise((resolve, reject) => {
      fetch(this.url, {
        mode: 'cors'
      }).then(resp=>resolve(resp.json()))
        .catch(err=>reject(err))
      })
  }

  async Update(item: ToDoItem):Promise<ToDoItem> {
    return new Promise((resolve,reject) => fetch(`${this.url}/${item.id}`, {
      method: 'PUT',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item)
    }).then(resp=>{resolve(resp.json() as Promise<ToDoItem>)})
      .catch(err=>reject(err))
    )
  }

  async Create(item: ToDoItem):Promise<ToDoItem> {
    return new Promise((resolve, reject) => {
      fetch(this.url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item)
      })
      .then(resp=>resolve(resp.json() as Promise<ToDoItem>))
      .catch(err=>reject(err))
    }
  )
  }
}
