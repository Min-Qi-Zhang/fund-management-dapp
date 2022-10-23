import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { ethers } from 'ethers';
import Alert from 'react-bootstrap/Alert';

class CreateSpendingCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      receiver: "",
      spendingAmt: 0,
      purpose: "",
      error: ''
    };
  }

  submit = async () => {
    this.setState({error: ''});
    if (typeof window.ethereum !== 'undefined') {
      this.props.requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(this.props.contractAddress, this.props.contractAbi, signer);
      try {
        let tx = await contract.createSpending(this.state.receiver, this.state.spendingAmt, this.state.purpose);
        await tx.wait();
        alert("CreateSpending Successful!");
      } catch (error) {
        this.setState({error: error.reason});
      }
    }
  };

  render() {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Create Spending</Card.Title>
          <Form>
            <Form.Group>
              <Form.Label>Receiver's address</Form.Label>
              <Form.Control
                onChange={(e) => this.setState({ receiver: e.target.value })}
              ></Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Spending amount</Form.Label>
              <Form.Control
                type="number"
                onChange={(e) => this.setState({ spendingAmt: e.target.value })}
              ></Form.Control>
              <Form.Text>This is the amount of 0.1 ETH to send, e.g. enter 1 will submit 0.1 ETH as spending amount</Form.Text>
            </Form.Group>
            <Form.Group>
              <Form.Label>Purpose</Form.Label>
              <Form.Control
                as="textarea"
                onChange={(e) => this.setState({ purpose: e.target.value })}
              ></Form.Control>
            </Form.Group>
            {this.state.error && <Alert variant="danger">{this.state.error}</Alert>}
            <Button variant="dark" onClick={() => this.submit()}>
              Submit
            </Button>
          </Form>
        </Card.Body>
      </Card>
    );
  }
}

export default CreateSpendingCard;
