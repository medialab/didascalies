import React, { Component } from 'react';

import ReactMarkdown from 'react-markdown';


import {
  Container,
  Columns,
  Column,
  Content,
  Title,
} from 'bloomer';
export default class Methodologie extends Component {

  render = () => {
    
    return (
      <Container> 
        <Columns>
          <Column isOffset={2} isSize={8}>
            <Title>
              Méthodologie
            </Title>
            <Content>
              <ReactMarkdown source={require('raw-loader!./methodologie.md')} />
            </Content>
          </Column>
        </Columns>
      </Container>
    )
  }
}