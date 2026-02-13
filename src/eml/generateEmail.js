import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  streamTransport: true,
  buffer: true,
  newline: 'windows',
});
