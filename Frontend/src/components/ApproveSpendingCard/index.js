import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { ethers } from 'ethers';

class ApproveSpendingCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spendingId: 0,
      vote: false
    };
  }

  submit = async () => {
    if (typeof window.ethereum !== 'undefined') {
      this.props.requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(this.props.contractAddress, this.props.contractAbi, signer);
      try {
        let tx = await contract.approveSpending(this.state.spendingId, this.state.vote);
        await tx.wait();
        alert("Voting is successful!");
      } catch (err) {
        console.log(err);
      }
    }
  }

  render() {
    return(
      <Card>
        <Card.Body>
          <Card.Title>Approve Spending</Card.Title>
          <Form>
            <Form.Group>
              <Form.Label>Spending ID</Form.Label>
              <Form.Control type="number"
                onChange={(e) => this.setState({ spendingId: e.target.value })}
              ></Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Vote</Form.Label>
              <Form.Select onChange={(e) => this.setState({ vote: e.target.value })}>
                <option>Click to select an option</option>
                <option value={true}>Approve</option>
                <option value={false}>Reject</option>
              </Form.Select>
            </Form.Group>
            <Button variant="dark" onClick={() => this.submit()}>Submit</Button>
          </Form>
        </Card.Body>
      </Card>
    )
  }
}

export default ApproveSpendingCard;