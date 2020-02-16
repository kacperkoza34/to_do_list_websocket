import React from 'react';
import io from 'socket.io-client';

class App extends React.Component {
  state = {
    tasks: [],
    formValue: '',
    validationError: false,
  }

  componentDidMount() {
    this.socket = io('http://localhost:8000');
    this.socket.on('serverMessage', newTasks => this.upDate(newTasks));
  }

  upDate(newTasks){
    this.setState({tasks: newTasks});
  }

  handleChange(event) {
    this.setState({formValue: event.target.value});
    if(event.target.value.length) this.setState({validationError: false});
  }

  emit(e) {
    e.preventDefault();
    const alredyExist = this.state.tasks.some( ({message}) => this.state.formValue == message);
    if(this.state.formValue.length && !alredyExist){
      this.socket.emit('clientMessage', { message: this.state.formValue });
      this.setState({tasks:[ ...this.state.tasks, {message: this.state.formValue, id: this.socket.id} ]});
      this.setState({formValue: ''});
      this.setState({validationError: false});
    }
    else this.setState({validationError: true});
  }

  removeTask(toDelet){
    const upDatedMessages = this.state.tasks.filter( ({message}) => message != toDelet);
    this.setState({tasks: upDatedMessages});
    this.socket.emit('clientMessageDelete', upDatedMessages);
  }

  render(){
    console.log(this.state.tasks);
    return (
      <div className="App">

        <header>
          <h1>ToDoList.app</h1>
        </header>

        <section className="tasks-section" id="tasks-section">
          <h2>Tasks</h2>

          <ul className="tasks-section__list" id="tasks-list">
            { !this.state.tasks.length ? '' : this.state.tasks.map( ({message, id}) =>
              <li className="task" key={id}>{message}
              <button className="btn btn--red" onClick={event =>{ event.preventDefault(); this.removeTask(message)} }>Remove</button></li>
              )
            }
          </ul>

          <form id="add-task-form" onSubmit={ (event) => this.emit(event)}>
            <input className="text-input"
                   autoComplete="off"
                   type="text"
                   placeholder="Type your description"
                   id="task-name"
                   value={this.state.formValue}
                   onChange={ event => this.handleChange(event)}
            />
            <button className="btn" type="submit">Add</button>
          </form>
          { this.state.validationError && <h6 className='error'>Add new task!</h6> }
        </section>
      </div>
    );
  }
}

export default App;
