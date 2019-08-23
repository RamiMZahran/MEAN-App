import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Post } from './post.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient,private router: Router) {}

  getPosts() {
    this.http
      .get<{ message: string; posts: Post[] }>(
        'http://localhost:3000/api/posts'
      )
      .subscribe(data => {
        this.posts = data.posts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http
      .post<{ message: string; post: Post }>(
        'http://localhost:3000/api/posts',
        postData
      )
      .subscribe(res => {
        console.log(res.message);
        this.router.navigate(['/']);
      });
  }
  updatePost(id: string, title: string, content: string) {
    const post: Post = { _id: id, title, content, imagePath: null };
    this.http
      .put<{ message: string }>('http://localhost:3000/api/posts/' + id, post)
      .subscribe(res => {
        console.log(res.message);
        this.router.navigate(['/']);

      });
  }

  getPost(id: string) {
    return this.http.get<{ message: string; post: Post }>(
      'http://localhost:3000/api/posts/' + id
    );
  }
  deletePost(id: string) {
    this.http
      .delete<{ message: string }>('http://localhost:3000/api/posts/' + id)
      .subscribe(res => {
        console.log(res.message);
        this.posts = this.posts.filter(post => post._id !== id);
        this.postsUpdated.next([...this.posts]);
      });
  }
}
