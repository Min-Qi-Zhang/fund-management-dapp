import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { ethers } from 'ethers';
import Alert from 'react-bootstrap/Alert';

class ExecuteSpendingCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spendingId: 0,
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
        let tx = await contract.executeSpending(this.state.spendingId);
        await tx.wait();
        alert("ExecuteSpending Successful!");
      } catch (error) {
        this.setState({error: error.reason});
      }
    }
  }

  render() {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Execute Spending</Card.Title>
          <Form>
            <Form.Group>
              <Form.Label>Spending ID</Form.Label>
              <Form.Control type="number"
                onChange={(e) => this.setState({ spendingId: e.target.value })}
              ></Form.Control>
            </Form.Group>
            {this.state.error && <Alert variant="danger">{this.state.error}</Alert>}
            <Button variant="dark" onClick={() => this.submit()}>Submit</Button>
          </Form>
        </Card.Body>
      </Card>
    );
  }
}

export default ExecuteSpendingCard;