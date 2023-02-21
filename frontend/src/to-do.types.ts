export interface ToDoItem {
  readonly id: string
  title: string
  description?: string
  created_at?: string
  completed?: boolean
}

export interface ToDoServiceInterface  {
  Read():Promise<ToDoItem[]>
  Update(item: ToDoItem):Promise<ToDoItem>
  Create(item: ToDoItem):Promise<ToDoItem>
}
