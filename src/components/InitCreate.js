import React from "react";
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom'
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import { Wizard, Step } from './Wizard'

import ALF from "alf-client";
const storage = ALF.utils.Storage();

class StepGenerate extends Step {
  constructor() {
    super(1);
  }

  renderStep() {
    return (
      <div>
        <h1>Create wallet</h1>
        <TextField className="field" label="Address" variant="filled" value={this.props.wallet.address} />
        <TextField className="field" label="Secret phrase" variant="filled" value={this.props.wallet.mnemonic} />
        <IconButton onClick={e => this.copy(e)}><FileCopyIcon/></IconButton>
        <div className="actions">
          <p>
            <Button onClick={e => this.props.next()} variant="contained" className="buttonLarge">Confirm</Button>
          </p>
          <p>
            <Link to="/">
              <Button variant="contained" className="buttonLarge">Cancel</Button>
            </Link>
          </p>
        </div>
      </div>
    )
  }

  copy(e) {
    navigator.clipboard.writeText(this.props.wallet.mnemonic);
  }

}

class StepConfirm extends Step {
  constructor() {
    super(2);
    this.state = {
      mnemonic: ""
    };
  }

  renderStep() {
    return (
      <div>
        <h1>Create wallet</h1>
        <TextField className="field" label="Secret phrase" value={this.state.mnemonic} onChange={e => this.updateMnemonic(e) }/>
        <div className="actions">
          <p>
            <Button onClick={e => this.create(e)} variant="contained" className="buttonLarge" disabled={!this.isMnemonicValid()}>Create</Button>
          </p>
          <p>
            <Button onClick={e => this.props.back()} variant="contained" className="buttonLarge">Back</Button>
          </p>
        </div>
      </div>
    )
  }

  create(e) {
    if (this.isMnemonicValid()) {
      storage.save('default', this.props.wallet);
      this.props.setWallet(this.props.wallet);
    }
  }

  isMnemonicValid() {
    return (this.props.wallet.mnemonic === this.state.mnemonic);
  }

  updateMnemonic(e) {
    this.setState({
      mnemonic: e.target.value
    });
  }
}

class InitCreate extends Wizard {
  constructor() {
    super();
    this.state.wallet = ALF.wallet.generate();
  }

  render() {
    return (
      <div>
        <StepGenerate step={this.state.step} next={this.next} wallet={this.state.wallet}/>
        <StepConfirm step={this.state.step} back={this.back} wallet={this.state.wallet} setWallet={this.props.setWallet}/>
      </div>
    )
  }
}

export default InitCreate;
