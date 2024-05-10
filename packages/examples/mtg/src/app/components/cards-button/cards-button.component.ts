import { Component } from '@angular/core';
import { FetchService } from '../../services/fetch.service';
import { CARDS } from '../../../constants/mtg.constants';

const cardsUrl = 'https://api.scryfall.com/cards/';

@Component({
  selector: 'app-cards-button',
  standalone: true,
  imports: [],
  templateUrl: './cards-button.component.html',
  styleUrl: './cards-button.component.scss'
})
export class CardsButtonComponent {
  constructor(private fetchService: FetchService) {
  }
  getMagicCard() {
    console.log('Getting cards');
    const url = cardsUrl + CARDS[this.getRandom()] + '?format=json';
    const type = 'card';
    const method = 'GET';
    this.fetchService.sendFetchRequest({ url, type, method });
  }
  private getRandom() {
    return Math.floor(Math.random() * CARDS.length) + 1;
  }
}
