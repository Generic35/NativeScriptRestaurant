import { Component, OnInit, Inject, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { RouterExtensions } from 'nativescript-angular/router';
import 'rxjs/add/operator/switchMap';
import { FavoriteService } from '../services/favorite.service';
import { TNSFontIconService } from 'nativescript-ngx-fonticon';
import { Toasty } from 'nativescript-toasty';
import { action } from "ui/dialogs";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";

import { Dish } from '../shared/dish';
import { Comment } from '../shared/comment';
import { CommentComponent } from '../comment/comment.component';
import { DishService } from '../services/dish.service';

@Component({
  selector: 'app-dishdetail',
  moduleId: module.id,
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.css']
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  comment: Comment;
  errMess: string;
  avgstars: string;
  numcomments: number;
  favorite: boolean = false;

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private favoriteservice: FavoriteService,
    private fonticon: TNSFontIconService,
    private routerExtensions: RouterExtensions,
    private modalService: ModalDialogService,
    private vcRef: ViewContainerRef,
    @Inject('BaseURL') private BaseURL) { }

  ngOnInit() {

    this.route.params
      .switchMap((params: Params) => this.dishservice.getDish(+params['id']))
      .subscribe(dish => {
        this.dish = dish;
        this.favorite = this.favoriteservice.isFavorite(this.dish.id);
        this.numcomments = this.dish.comments.length;

        let total = 0;
        this.dish.comments.forEach(comment => total += comment.rating);
        this.avgstars = (total / this.numcomments).toFixed(2);
      },
        errmess => { this.dish = null; this.errMess = <any>errmess; });
  }

  addToFavorites() {
    if (!this.favorite) {
      console.log('Adding to Favorites', this.dish.id);
      this.favorite = this.favoriteservice.addFavorite(this.dish.id);
      const toast = new Toasty("Added Dish " + this.dish.id, "short", "bottom");
      toast.show();
    }
  }

  openActionDialog() {
    let options = {
      title: "Dish Detail Actions",
      message: "Choose Your Action",
      cancelButtonText: "Cancel",
      actions: ["Add to Favorites", "Add Comment"]
    };

    action(options).then((result) => {
      if(result === "Add to Favorites"){
        this.addToFavorites();
        console.log('adding to favorites');
      } else {
        console.log('adding a comment');

        let options: ModalDialogOptions = {
          viewContainerRef: this.vcRef,
          fullscreen: false
      };

        this.modalService.showModal(CommentComponent, options)
        .then((result: any) => {
            console.log( `the comment modal has returned ${result}`);
            let comment: Comment = result;
            comment.date = new Date().toISOString();
            this.dish.comments.push(comment);
            console.log( `saving comment...`)
        });
      }
      console.log(`results of action dialog selection ${result}`);
    });
  }
  goBack(): void {
    this.routerExtensions.back();
  }
}