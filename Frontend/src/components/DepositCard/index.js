import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { FaArrowDown } from "react-icons/fa";
import { ethers } from 'ethers';

import "./index.css";

class DepositCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: "Deposit",
      eth: 0,
      fmd: 0,
    };
  }

  toggleMode = () => {
    this.setState({mode: this.state.mode === 'Deposit' ? 'Withdraw' : 'Deposit'});
  }

  updateValues = (e, eth_or_fmd) => {
    if (eth_or_fmd === 'ETH') {
      this.setState({ eth: e.target.value, fmd: e.target.value * 10 })
    } else {
      this.setState({ eth: e.target.value / 10, fmd: e.target.value })
    }
  }

  depositOrWithDraw = async () => {
    if (typeof window.ethereum !== 'undefined') {
      this.props.requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(this.props.contractAddress, this.props.contractAbi, signer);
      try {
        if (this.state.mode === 'Deposit') {
          let tx = await contract.deposit(this.state.fmd, {
            value: ethers.utils.parseEther(this.state.eth.toString())
          });
          await tx.wait();
          alert("Deposit successful!");
        } else if (this.state.mode === 'Withdraw') {
          const token = new ethers.Contract(this.props.tokenAddress, this.props.tokenAbi, signer);
          let tx = await token.approve(this.props.contractAddress, ethers.utils.parseEther(this.state.fmd.toString()));
          await tx.wait();
          await contract.withdraw(this.state.fmd);
          alert("Withdraw successful!");
        }
      } catch (err) {
        console.log('Error: ', err);
      }
    }
  };

  componentDidMount = async () => {
    if (this.props.contract) {
      let contract = this.props.contract;
    const shareToken = await contract.getShareToken();
    console.log('shareToken: ', shareToken);
    }
    
  }

  render() {
    return (
      <Card className="deposit_card">
        <Card.Body>
          <Card.Title>{this.state.mode}</Card.Title>
          <Form>
            <InputGroup>
              <Form.Control
                size="lg"
                type="number"
                onChange={(e) =>
                  this.updateValues(e, this.state.mode === 'Deposit' ? 'ETH' : 'FMD')
                }
                value={this.state.mode === 'Deposit' ? this.state.eth : this.state.fmd}
              ></Form.Control>
              <InputGroup.Text className="inputgroup_text">{this.state.mode === 'Deposit' ? 'ETH' : 'FMD'}</InputGroup.Text>
            </InputGroup>

            <Button variant="light" onClick={this.toggleMode}>
              <FaArrowDown size={20} />
            </Button>

            <InputGroup>
              <Form.Control
                size="lg"
                type="number"
                onChange={(e) =>
                  this.updateValues(e, this.state.mode === 'Deposit' ? 'FMD' : 'ETH')
                }
                value={this.state.mode === 'Deposit' ? this.state.fmd : this.state.eth}
              ></Form.Control>
              <InputGroup.Text className="inputgroup_text">{this.state.mode === 'Deposit' ? 'FMD' : 'ETH'}</InputGroup.Text>
            </InputGroup>
            
            <Form.Text muted>0.1ETH = 1FMD</Form.Text>
            <br />
            <Button variant="dark" onClick={() => this.depositOrWithDraw()}>{this.state.mode}</Button>
          </Form>
        </Card.Body>
      </Card>
    );
  }
}

export default DepositCard;
