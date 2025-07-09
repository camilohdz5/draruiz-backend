-- CreateIndex
CREATE INDEX "Message_conversation_id_idx" ON "Message"("conversation_id");

-- CreateIndex
CREATE INDEX "Message_user_id_idx" ON "Message"("user_id");

-- CreateIndex
CREATE INDEX "Message_created_at_idx" ON "Message"("created_at");
